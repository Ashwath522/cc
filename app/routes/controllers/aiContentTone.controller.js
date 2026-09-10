'use strict';

const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const ToneOverrideModel = require('../../models/toneOverride.model');
const {
  TONE_PRESETS,
  getEffectiveToneDetails,
  setToneOverrideInMemory,
  removeToneOverrideFromMemory,
} = require('../../helpers/ai-content/tone');

/**
 * Returns list of all 5 available tone presets with effective rule text and override status.
 */
const listTonePresets = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;

  try {
    const toneList = await Promise.all(
      Object.keys(TONE_PRESETS).map(async (toneId) => {
        const details = await getEffectiveToneDetails({
          companyId,
          applicationId,
          toneId,
        });
        return {
          id: toneId,
          label: TONE_PRESETS[toneId].label,
          ...details,
        };
      }),
    );

    return res.json({
      success: true,
      tones: toneList,
    });
  } catch (error) {
    logger.error(`[listTonePresets] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

/**
 * Returns effective tone rule_text for tenant (override if exists, else shipped default).
 */
const getTonePreset = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;
  const { toneId } = req.params;

  try {
    if (!TONE_PRESETS[toneId]) {
      return res.status(404).json({
        error: `Unknown tone "${toneId}". Available tones: ${Object.keys(TONE_PRESETS).join(', ')}`,
      });
    }

    const details = await getEffectiveToneDetails({
      companyId,
      applicationId,
      toneId,
    });

    return res.json({
      success: true,
      tone: details,
    });
  } catch (error) {
    logger.error(`[getTonePreset] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

/**
 * Upserts a tenant-specific toneOverride document.
 */
const updateTonePreset = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.body.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.body.application_id;
  const { toneId } = req.params;
  const { rule_text } = req.body;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    if (!TONE_PRESETS[toneId]) {
      return res.status(400).json({
        error: `Invalid tone "${toneId}". Only existing presets can be edited: ${Object.keys(TONE_PRESETS).join(', ')}`,
      });
    }

    if (!rule_text || typeof rule_text !== 'string' || !rule_text.trim()) {
      return res.status(400).json({ error: 'rule_text must be a non-empty string' });
    }

    const trimmedText = rule_text.trim();
    let override = null;

    try {
      if (ToneOverrideModel && typeof ToneOverrideModel.findOneAndUpdate === 'function') {
        override = await ToneOverrideModel.findOneAndUpdate(
          {
            company_id: companyId,
            application_id: applicationId,
            tone_id: toneId,
          },
          {
            rule_text: trimmedText,
            updated_by: req.user?.username || req.user?.email || 'user',
            updated_at: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    } catch (dbErr) {
      // Continue if DB unavailable in mock mode
    }

    setToneOverrideInMemory(companyId, applicationId, toneId, trimmedText);

    return res.json({
      success: true,
      message: 'Tone preset updated successfully',
      tone: {
        tone_id: toneId,
        label: TONE_PRESETS[toneId].label,
        rule_text: trimmedText,
        is_overridden: true,
        updated_at: override?.updated_at || new Date(),
        updated_by: override?.updated_by || 'user',
      },
    });
  } catch (error) {
    logger.error(`[updateTonePreset] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

/**
 * Deletes tenant toneOverride document, reverting to shipped default.
 */
const resetTonePreset = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.body.company_id || req.query.company_id;
  const applicationId =
    req.params.application_id || req.headers['x-application-id'] || req.body.application_id || req.query.application_id;
  const { toneId } = req.params;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    if (!TONE_PRESETS[toneId]) {
      return res.status(404).json({
        error: `Unknown tone "${toneId}". Available tones: ${Object.keys(TONE_PRESETS).join(', ')}`,
      });
    }

    try {
      if (ToneOverrideModel && typeof ToneOverrideModel.deleteOne === 'function') {
        await ToneOverrideModel.deleteOne({
          company_id: companyId,
          application_id: applicationId,
          tone_id: toneId,
        });
      }
    } catch (dbErr) {
      // Continue if DB unavailable in mock mode
    }

    removeToneOverrideFromMemory(companyId, applicationId, toneId);

    return res.json({
      success: true,
      message: 'Tone preset reset to default',
      tone: {
        tone_id: toneId,
        label: TONE_PRESETS[toneId].label,
        rule_text: TONE_PRESETS[toneId].rule_text,
        default_rule_text: TONE_PRESETS[toneId].rule_text,
        is_overridden: false,
      },
    });
  } catch (error) {
    logger.error(`[resetTonePreset] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  listTonePresets,
  getTonePreset,
  updateTonePreset,
  resetTonePreset,
};
