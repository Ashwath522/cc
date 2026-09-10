const generatedHTMLString = [
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Product Tags</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        height: 100vh;
        width: 100vw;
        font-family: Arial, sans-serif;
        background: #fff;
      }

      .tag-container {
        flex: 1;
        border-right: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5cm;
        box-sizing: border-box;
      }

      .tag-container:last-child {
        border-right: none;
      }

      /* Tag Styles */
      .tag {
        width: 100%;
        height: 100%;
        border: 1px solid #999;
        border-radius: 6px;
        padding: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fafafa;
      }

      .tag-header {
        text-align: center;
        border-bottom: 1px solid #ddd;
        padding-bottom: 0.5rem;
      }

      .brand-name {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
      }

      .product-name {
        font-size: 1rem;
        color: #555;
      }

      .tag-body {
        flex: 1;
        padding-top: 0.5rem;
      }

      .price {
        margin: 0.2rem 0;
        font-size: 0.95rem;
      }

      .price .label {
        font-weight: bold;
      }

      .discounted .value {
        color: #e53935;
        font-weight: bold;
      }

      .attributes {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }

      .attribute {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.1rem;
      }

      .barcode {
        text-align: center;
        margin-top: 0.5rem;
      }

      .barcode img {
        max-width: 100%;
        height: auto;
      }

      .tag-footer {
        text-align: center;
        font-size: 0.8rem;
        border-top: 1px solid #ddd;
        padding-top: 0.4rem;
      }

      .product-link {
        color: #0066cc;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹1500000</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹800000</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Primary Material Type:</span>
          <span class="value">Solid Wood</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/dalla-dining-chairs-set-of-2-colour-beige-7502062" class="product-link">https://www.urbanladder.com/product/dalla-dining-chairs-set-of-2-colour-beige-7502062</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹1000000</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹700000</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">3 Seater</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/adelaide-essential-3-seater-fabric-sofa-pearl-7534324" class="product-link">https://www.urbanladder.com/product/adelaide-essential-3-seater-fabric-sofa-pearl-7534324</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Right Aligned 3 Seater + Right Aligned Chaise + Ottoman</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-right-aligned-3-seater-sofa-with-ottoman-hard-cushion-ash-grey-velvet-7534740" class="product-link">https://www.urbanladder.com/product/apollo-right-aligned-3-seater-sofa-with-ottoman-hard-cushion-ash-grey-velvet-7534740</a>
  </div>
</div>
</div>
  </body>
</html>
`,
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Product Tags</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        height: 100vh;
        width: 100vw;
        font-family: Arial, sans-serif;
        background: #fff;
      }

      .tag-container {
        flex: 1;
        border-right: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5cm;
        box-sizing: border-box;
      }

      .tag-container:last-child {
        border-right: none;
      }

      /* Tag Styles */
      .tag {
        width: 100%;
        height: 100%;
        border: 1px solid #999;
        border-radius: 6px;
        padding: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fafafa;
      }

      .tag-header {
        text-align: center;
        border-bottom: 1px solid #ddd;
        padding-bottom: 0.5rem;
      }

      .brand-name {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
      }

      .product-name {
        font-size: 1rem;
        color: #555;
      }

      .tag-body {
        flex: 1;
        padding-top: 0.5rem;
      }

      .price {
        margin: 0.2rem 0;
        font-size: 0.95rem;
      }

      .price .label {
        font-weight: bold;
      }

      .discounted .value {
        color: #e53935;
        font-weight: bold;
      }

      .attributes {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }

      .attribute {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.1rem;
      }

      .barcode {
        text-align: center;
        margin-top: 0.5rem;
      }

      .barcode img {
        max-width: 100%;
        height: auto;
      }

      .tag-footer {
        text-align: center;
        font-size: 0.8rem;
        border-top: 1px solid #ddd;
        padding-top: 0.4rem;
      }

      .product-link {
        color: #0066cc;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Left Aligned 3 Seater + Left Aligned Chaise + Ottoman</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-compact-left-aligned-3-seater-sofa-with-ottoman-hard-cushion-ash-grey-velvet-7534749" class="product-link">https://www.urbanladder.com/product/apollo-compact-left-aligned-3-seater-sofa-with-ottoman-hard-cushion-ash-grey-velvet-7534749</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Left Aligned 3 Seater + Left Aligned Chaise + Ottoman</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-compact-left-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7534762" class="product-link">https://www.urbanladder.com/product/apollo-compact-left-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7534762</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Right Aligned 3 Seater + Right Aligned Chaise + Ottoman</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-compact-right-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7534765" class="product-link">https://www.urbanladder.com/product/apollo-compact-right-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7534765</a>
  </div>
</div>
</div>
  </body>
</html>
`,
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Product Tags</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        height: 100vh;
        width: 100vw;
        font-family: Arial, sans-serif;
        background: #fff;
      }

      .tag-container {
        flex: 1;
        border-right: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5cm;
        box-sizing: border-box;
      }

      .tag-container:last-child {
        border-right: none;
      }

      /* Tag Styles */
      .tag {
        width: 100%;
        height: 100%;
        border: 1px solid #999;
        border-radius: 6px;
        padding: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fafafa;
      }

      .tag-header {
        text-align: center;
        border-bottom: 1px solid #ddd;
        padding-bottom: 0.5rem;
      }

      .brand-name {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
      }

      .product-name {
        font-size: 1rem;
        color: #555;
      }

      .tag-body {
        flex: 1;
        padding-top: 0.5rem;
      }

      .price {
        margin: 0.2rem 0;
        font-size: 0.95rem;
      }

      .price .label {
        font-weight: bold;
      }

      .discounted .value {
        color: #e53935;
        font-weight: bold;
      }

      .attributes {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }

      .attribute {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.1rem;
      }

      .barcode {
        text-align: center;
        margin-top: 0.5rem;
      }

      .barcode img {
        max-width: 100%;
        height: auto;
      }

      .tag-footer {
        text-align: center;
        font-size: 0.8rem;
        border-top: 1px solid #ddd;
        padding-top: 0.4rem;
      }

      .product-link {
        color: #0066cc;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Right Aligned 3 Seater + Right Aligned Chaise + Ottoman</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-right-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7535066" class="product-link">https://www.urbanladder.com/product/apollo-right-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7535066</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹299997</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Right Aligned 2 Seater + Right Aligned Chaise + Ottoman</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-compact-right-aligned-2-seater-sofa-with-ottoman-soft-cushion-pebble-grey-7534683" class="product-link">https://www.urbanladder.com/product/apollo-compact-right-aligned-2-seater-sofa-with-ottoman-soft-cushion-pebble-grey-7534683</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹199998</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹199998</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">1 Seater</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">No</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-3-1-seater-sofa-color-birch-beige-cushion-type-soft-7535049" class="product-link">https://www.urbanladder.com/product/apollo-3-1-seater-sofa-color-birch-beige-cushion-type-soft-7535049</a>
  </div>
</div>
</div>
  </body>
</html>
`,
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Product Tags</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        height: 100vh;
        width: 100vw;
        font-family: Arial, sans-serif;
        background: #fff;
      }

      .tag-container {
        flex: 1;
        border-right: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5cm;
        box-sizing: border-box;
      }

      .tag-container:last-child {
        border-right: none;
      }

      /* Tag Styles */
      .tag {
        width: 100%;
        height: 100%;
        border: 1px solid #999;
        border-radius: 6px;
        padding: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fafafa;
      }

      .tag-header {
        text-align: center;
        border-bottom: 1px solid #ddd;
        padding-bottom: 0.5rem;
      }

      .brand-name {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
      }

      .product-name {
        font-size: 1rem;
        color: #555;
      }

      .tag-body {
        flex: 1;
        padding-top: 0.5rem;
      }

      .price {
        margin: 0.2rem 0;
        font-size: 0.95rem;
      }

      .price .label {
        font-weight: bold;
      }

      .discounted .value {
        color: #e53935;
        font-weight: bold;
      }

      .attributes {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }

      .attribute {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.1rem;
      }

      .barcode {
        text-align: center;
        margin-top: 0.5rem;
      }

      .barcode img {
        max-width: 100%;
        height: auto;
      }

      .tag-footer {
        text-align: center;
        font-size: 0.8rem;
        border-top: 1px solid #ddd;
        padding-top: 0.4rem;
      }

      .product-link {
        color: #0066cc;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹400000</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹200000</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
        <div class="attribute">
          <span class="label">Primary Color:</span>
          <span class="value">Blue</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/mto-winchester-3-seater-fabric-sofa-by-fayaz-7563253" class="product-link">https://www.urbanladder.com/product/mto-winchester-3-seater-fabric-sofa-by-fayaz-7563253</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹199998</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹199998</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Seating Capacity:</span>
          <span class="value">Left Aligned 3 Seater + Left Aligned Chaise</span>
        </div>
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/apollo-compact-left-aligned-3-seater-sofa-with-chaise-hard-cushion-ash-grey-velvet-7534763" class="product-link">https://www.urbanladder.com/product/apollo-compact-left-aligned-3-seater-sofa-with-chaise-hard-cushion-ash-grey-velvet-7534763</a>
  </div>
</div>
</div>
    <div class="tag-container">
<div class="tag">
  <div class="tag-header">
    <div class="brand-name"></div>
    <div class="product-name"></div>
  </div>
  <div class="tag-body">
    <div class="price">
      <span class="label">MRP:</span>
      <span class="value">₹196100</span>
    </div>
    <div class="price discounted">
      <span class="label">Discounted:</span>
      <span class="value">₹196100</span>
    </div>
    <div class="attributes">
        <div class="attribute">
          <span class="label">Assembly Required:</span>
          <span class="value">Pre Assembled</span>
        </div>
        <div class="attribute">
          <span class="label">Upholstery Material:</span>
          <span class="value">Leatherette</span>
        </div>
    </div>
    <div class="barcode">
      <img src="" alt="Barcode" />
    </div>
  </div>
  <div class="tag-footer">
    <a href="https://www.urbanladder.com/product/bardot-lounge-chair-tuscan-red-velvet-7502111" class="product-link">https://www.urbanladder.com/product/bardot-lounge-chair-tuscan-red-velvet-7502111</a>
  </div>
</div>
</div>
  </body>
</html>
`,
];

const mockDetailedData = [
  {
    item_type: "standard",
    slug: "apollo-3-1-seater-sofa-color-birch-beige-cushion-type-soft-7535049",
    no_of_boxes: 1,
    departments: [217],
    description:
      "Apollo 1 Seater Sofa with Cushion (Color : Birch Beige, Cushion Type : Soft)",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    is_dependent: false,
    action: "upsert",
    brand_uid: 283,
    is_set: false,
    uid: 7535049,
    custom_order: {
      manufacturing_time_unit: "days",
      manufacturing_time: 0,
      is_custom_order: false,
    },
    multi_size: false,
    name: "Apollo 3 + 1 Seater Sofa (Color : Birch Beige, Cushion Type : Soft)",
    return_config: {
      returnable: true,
      unit: "days",
      time: 7,
    },
    tags: ["combo"],
    country_of_origin: "India",
    is_image_less_product: false,
    product_publish: {
      product_online_date: "2025-10-15T16:23:58",
      is_set: false,
    },
    currency: "INR",
    category_slug: "fabric-sofas",
    item_code: "NEWVCBB0004",
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      colour: "fabric-sofas-59731509-18464675",
    },
    created_on: "2025-01-22T09:00:32.054000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-15T16:23:59.336000",
    modified_by: {
      username: "chiragsolanki_gofynd_com_55707",
      user_id: "48f2a2367bb469f7f3997f20",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["NEWVCBB0004"],
    all_sizes: [
      {
        track_inventory: false,
        item_length: 10,
        identifiers: [
          {
            primary: true,
            gtin_type: "sku_code",
            gtin_value: "NEWVCBB0004",
          },
        ],
        size: "REGULAR",
        seller_identifier: "NEWVCBB0004",
        price: {
          marked: {
            min: 199998,
            max: 199998,
          },
          effective: {
            min: 199998,
            max: 199998,
          },
        },
        brand_uid: 283,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534887,
                item: {
                  item_code: "FFNSF51ACBB30003HAAAA",
                  slug: "apollo-compact-3-seater-hard-cushion-henge-birch-beige-7534887",
                  name: "Apollo Compact 3 Seater - Hard Cushion (Henge - Birch beige)",
                  attributes: {
                    identifier: {
                      sku_code: ["FFNSF51ACBB30003HAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      rate: 18,
                      cess: 0,
                      effective_date: "2024-03-29T19:05:00",
                    },
                  ],
                  hsn_code: "94031090",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534898,
                item: {
                  item_code: "FFNSF51ACBB30001SAAAA",
                  slug: "apollo-compact-1-seater-soft-cushion-henge-birch-beige-7534898",
                  name: "Apollo Compact 1 Seater - Soft Cushion (Henge - Birch beige)",
                  attributes: {
                    identifier: {
                      sku_code: ["FFNSF51ACBB30001SAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      rate: 18,
                      cess: 0,
                      effective_date: "2024-03-29T19:05:00",
                    },
                  ],
                  hsn_code: "94031090",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        item_code: "NEWVCBB0004",
        company_id: 95,
        item_height: 10,
        item_weight: 10,
        item_width: 10,
        price_transfer: 0,
        sellable: true,
      },
    ],
    _custom_json: {},
    highlights: [],
    short_description: "",
    size_guide: "",
    teaser_tag: {},
    variant_media: {},
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "cushion-type": "Soft",
      "assembly-required": "No",
      "has-free-installation": "No",
      "storage-included": "With Storage",
      "back-height": "High Back",
      colour: "Beige",
      "seating-capacity": "1 Seater",
      "sofa-material": "Fabric",
      "show-on-plp": "No",
      "ul-premium-space": "372",
      "ul-rank": 418,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 20,
        sellable: true,
        price: {
          marked: {
            min: 199998,
            max: 199998,
          },
          effective: {
            min: 199998,
            max: 199998,
          },
        },
        seller_identifier: "NEWVCBB0004",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "6790b3b0380dbd4e5b4c18b8",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 199998,
        max: 199998,
      },
      effective: {
        min: 199998,
        max: 199998,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    country_of_origin: "India",
    tags: [],
    return_config: {
      time: 7,
      returnable: true,
      unit: "days",
    },
    multi_size: true,
    action: "upsert",
    brand_uid: 448,
    uid: 7534324,
    product_publish: {
      product_online_date: "2025-10-13T11:05:34",
      is_set: false,
    },
    departments: [217],
    currency: "INR",
    custom_order: {
      manufacturing_time: 9,
      manufacturing_time_unit: "days",
      is_custom_order: true,
    },
    is_set: false,
    category_slug: "fabric-sofas",
    description: "Fabric",
    item_type: "standard",
    is_image_less_product: false,
    name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
    slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
    item_code: "FNSF51ABPL30003",
    no_of_boxes: 1,
    is_dependent: false,
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      colour: "Adelaide-Essential",
      "seating-capacity": "Adelaide-Essential",
    },
    created_on: "2024-09-18T07:43:33.504000",
    created_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    modified_on: "2025-10-13T11:05:48.790000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["FNSF51ABPL30003"],
    all_sizes: [
      {
        price_transfer: 0,
        item_weight: 47000,
        track_inventory: false,
        brand_uid: 448,
        seller_identifier: "FNSF51ABPL30003",
        price: {
          marked: {
            min: 1000000,
            max: 1000000,
          },
          effective: {
            min: 700000,
            max: 700000,
          },
        },
        item_height: 90.932,
        company_id: 95,
        item_code: "FNSF51ABPL30003",
        identifiers: [
          {
            gtin_type: "sku_code",
            gtin_value: "FNSF51ABPL30003",
            primary: true,
          },
        ],
        item_length: 198.12,
        item_width: 87.63,
        size: "REGULAR",
        _custom_json: {},
        sellable: true,
      },
    ],
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
        type: "image",
      },
    ],
    _custom_json: {},
    highlights: [],
    net_quantity: {},
    short_description: "",
    size_guide: "",
    teaser_tag: {},
    variant_media: {},
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "649184055ea831241afd2400",
      reporting_hsn: "94038900H1",
      hsn_code: "94038900",
    },
    attributes: {
      "sofa-material": "Fabric",
      "assembly-required": "Pre Assembled",
      "has-free-installation": "No",
      "seating-capacity": "3 Seater",
      colour: "Pearl",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "27",
      "ul-rank": 73,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 1000000,
            max: 1000000,
          },
          effective: {
            min: 700000,
            max: 700000,
          },
        },
        seller_identifier: "FNSF51ABPL30003",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "66ea84a556de79f36df191d2",
    brand: {
      name: "Urban Ladder Create",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.swadeshonline.com/v2/patient-paper-41f385/swad-p/t.resize(w:50)/brands/pictures/square-logo/original/d_9a0Pbsj-Logo.jpeg",
        secure_url:
          "https://cdn.swadeshonline.com/v2/patient-paper-41f385/swad-p/t.resize(w:50)/brands/pictures/square-logo/original/d_9a0Pbsj-Logo.jpeg",
      },
      uid: 448,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
      },
    ],
    price: {
      marked: {
        min: 1000000,
        max: 1000000,
      },
      effective: {
        min: 700000,
        max: 700000,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "649184055ea831241afd2400",
  },
  {
    uid: 7534762,
    no_of_boxes: 1,
    departments: [217],
    country_of_origin: "India",
    slug: "apollo-compact-left-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7534762",
    is_dependent: false,
    item_type: "standard",
    currency: "INR",
    category_slug: "fabric-sofas",
    multi_size: false,
    action: "upsert",
    name: "Apollo Compact Left Aligned 3 Seater Sofa with Ottoman (Soft Cushion, Ash Grey Velvet)",
    return_config: {
      time: 7,
      returnable: true,
      unit: "days",
    },
    custom_order: {
      manufacturing_time_unit: "days",
      manufacturing_time: 0,
      is_custom_order: false,
    },
    tags: [],
    brand_uid: 283,
    description:
      "Apollo Compact Left Aligned 3 Seater Sofa with Ottoman (Soft Cushion, Ash Grey Velvet)",
    product_publish: {
      product_online_date: "2025-10-13T11:05:34",
      is_set: false,
    },
    is_image_less_product: false,
    item_code: "APOLLO72",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    is_set: false,
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-15T10:37:10.759000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:42.298000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLO72"],
    all_sizes: [
      {
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        seller_identifier: "APOLLO72",
        company_id: 95,
        item_length: 100,
        item_weight: 10000,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534425,
                item: {
                  item_code: "FNSF51ACAG3000TSAAAA",
                  slug: "apollo-compact-fabric-sofa-ash-grey-velvet-ottoman-7534425",
                  name: "Apollo Compact Fabric Sofa (Ash Grey Velvet) Ottoman",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3000TSAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      effective_date: "2023-06-01T19:05:00",
                      threshold: 0,
                      rate: 18,
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534430,
                item: {
                  item_code: "FNSF51ACAG3L00CSAAAA",
                  slug: "apollo-sectional-compact-fabric-sofa-ash-grey-velvet-left-aligned-chaise-7534430",
                  name: "Apollo Sectional Compact Fabric Sofa (Ash Grey Velvet) Left Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3L00CSAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      rate: 18,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                      threshold: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534428,
                item: {
                  item_code: "FNSF51ACAG3L003SAAAA",
                  slug: "apollo-sectional-compact-fabric-sofa-ash-grey-velvet-left-aligned-3-seater-7534428",
                  name: "Apollo Sectional Compact Fabric Sofa (Ash Grey Velvet) Left Aligned 3 Seater",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3L003SAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        size: "REGULAR",
        track_inventory: false,
        brand_uid: 283,
        identifiers: [
          {
            gtin_value: "APOLLO72",
            primary: true,
            gtin_type: "sku_code",
          },
        ],
        item_height: 100,
        price_transfer: 0,
        item_code: "APOLLO72",
        item_width: 100,
        sellable: true,
      },
    ],
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "assembly-required": "Pre Assembled",
      "sofa-material": "Fabric",
      "has-free-installation": "No",
      "back-height": "Regular",
      colour: "Ash Grey Velvet",
      "cushion-type": "Soft",
      "footrest-included": "Compact",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity":
        "Left Aligned 3 Seater + Left Aligned Chaise + Ottoman",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "282",
      "ul-rank": 328,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 299997,
            max: 299997,
          },
          effective: {
            min: 299997,
            max: 299997,
          },
        },
        seller_identifier: "APOLLO72",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "67878fd6e19145419c635a67",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 299997,
        max: 299997,
      },
      effective: {
        min: 299997,
        max: 299997,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    name: "Apollo High Back Compact Left Aligned 3 Seater Sofa with Chaise (Hard Cushion, Ash Grey Velvet)",
    is_dependent: false,
    description:
      "Apollo Compact Left Aligned 3 Seater Sofa with Chaise (Hard Cushion, Ash Grey Velvet)",
    is_set: false,
    category_slug: "fabric-sofas",
    product_publish: {
      is_set: false,
      product_online_date: "2025-10-13T11:05:34",
    },
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    departments: [217],
    country_of_origin: "India",
    tags: [],
    brand_uid: 283,
    no_of_boxes: 1,
    currency: "INR",
    item_type: "standard",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    custom_order: {
      manufacturing_time: 0,
      is_custom_order: false,
      manufacturing_time_unit: "days",
    },
    action: "upsert",
    multi_size: false,
    is_image_less_product: false,
    slug: "apollo-compact-left-aligned-3-seater-sofa-with-chaise-hard-cushion-ash-grey-velvet-7534763",
    item_code: "APOLLO96",
    uid: 7534763,
    return_config: {
      unit: "days",
      returnable: true,
      time: 7,
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-15T10:37:10.850000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:40.493000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLO96"],
    all_sizes: [
      {
        size: "REGULAR",
        track_inventory: false,
        item_width: 100,
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        item_weight: 10000,
        identifiers: [
          {
            gtin_type: "sku_code",
            gtin_value: "APOLLO96",
            primary: true,
          },
        ],
        brand_uid: 283,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534445,
                item: {
                  item_code: "FNSF51ACAG3L003HAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-ash-grey-velvet-left-aligned-3-seater-7534445",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Ash Grey Velvet) Left Aligned 3 Seater",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3L003HAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      rate: 18,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                      threshold: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534460,
                item: {
                  item_code: "FNSF51ACAG3L00CHAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-ash-grey-velvet-left-aligned-chaise-7534460",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Ash Grey Velvet) Left Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3L00CHAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      cess: 0,
                      effective_date: "2023-06-01T19:05:00",
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        seller_identifier: "APOLLO96",
        item_code: "APOLLO96",
        price_transfer: 0,
        item_height: 100,
        item_length: 100,
        company_id: 95,
        sellable: true,
      },
    ],
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "has-free-installation": "No",
      "sofa-material": "Fabric",
      "assembly-required": "Pre Assembled",
      "back-height": "High Back",
      colour: "Ash Grey Velvet",
      "cushion-type": "Hard",
      "footrest-included": "Compact",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity": "Left Aligned 3 Seater + Left Aligned Chaise",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "279",
      "ul-rank": 325,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 199998,
            max: 199998,
          },
          effective: {
            min: 199998,
            max: 199998,
          },
        },
        seller_identifier: "APOLLO96",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "67878fd685273d03ca435a54",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 199998,
        max: 199998,
      },
      effective: {
        min: 199998,
        max: 199998,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    description:
      "Apollo Right Aligned 3 Seater Sofa with Ottoman (Soft Cushion)",
    departments: [217],
    tags: [],
    is_image_less_product: false,
    action: "upsert",
    item_type: "standard",
    multi_size: false,
    product_publish: {
      product_online_date: "2025-10-13T11:05:34",
      is_set: false,
    },
    is_dependent: false,
    category_slug: "fabric-sofas",
    currency: "INR",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    custom_order: {
      manufacturing_time_unit: "days",
      is_custom_order: false,
      manufacturing_time: 0,
    },
    net_quantity: {
      unit: "nos",
      value: 1,
    },
    slug: "apollo-right-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7535066",
    return_config: {
      time: 7,
      unit: "days",
      returnable: true,
    },
    name: "Apollo Right Aligned 3 Seater Sofa with Ottoman (Soft Cushion, Ash Grey Velvet)",
    uid: 7535066,
    country_of_origin: "India",
    brand_uid: 283,
    no_of_boxes: 1,
    item_code: "APOLLO36",
    is_set: false,
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-31T05:07:01.256000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:39.303000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLO36"],
    all_sizes: [
      {
        identifiers: [
          {
            gtin_value: "APOLLO36",
            primary: true,
            gtin_type: "sku_code",
          },
        ],
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534447,
                item: {
                  item_code: "FNSF51APAG3000TSAAAA",
                  slug: "apollo-fabric-sofa-ash-grey-velvet-ottoman-7534447",
                  name: "Apollo Fabric Sofa (Ash Grey Velvet) Ottoman",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51APAG3000TSAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                },
              },
              {
                isHero: false,
                quantity: 2,
                uid: 7534526,
                item: {
                  item_code: "FNSF51APAG3R00CSAAAA",
                  slug: "apollo-sectional-fabric-sofa-ash-grey-velvet-right-aligned-chaise-7534526",
                  name: "Apollo Sectional Fabric Sofa (Ash Grey Velvet) Right Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51APAG3R00CSAAAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      effective_date: "2023-06-01T19:05:00",
                      rate: 18,
                      threshold: 0,
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                },
              },
            ],
          },
        },
        company_id: 95,
        seller_identifier: "APOLLO36",
        size: "REGULAR",
        track_inventory: false,
        item_height: 100,
        item_width: 100,
        item_weight: 10000,
        price_transfer: 0,
        item_length: 100,
        brand_uid: 283,
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        item_code: "APOLLO36",
        sellable: true,
      },
    ],
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "sofa-material": "Fabric",
      "assembly-required": "Pre Assembled",
      "cushion-type": "Soft",
      "has-free-installation": "No",
      "back-height": "Regular",
      colour: "Ash Grey Velvet",
      "footrest-included": "Regular",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity":
        "Right Aligned 3 Seater + Right Aligned Chaise + Ottoman",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "No",
      "ul-premium-space": "374",
      "ul-rank": 420,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 1000,
        sellable: true,
        price: {
          marked: {
            min: 299997,
            max: 299997,
          },
          effective: {
            min: 299997,
            max: 299997,
          },
        },
        seller_identifier: "APOLLO36",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "679c5a75d0baca541c4613c0",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 299997,
        max: 299997,
      },
      effective: {
        min: 299997,
        max: 299997,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    uid: 7534740,
    no_of_boxes: 1,
    departments: [217],
    country_of_origin: "India",
    slug: "apollo-right-aligned-3-seater-sofa-with-ottoman-hard-cushion-ash-grey-velvet-7534740",
    is_dependent: false,
    item_type: "standard",
    currency: "INR",
    category_slug: "fabric-sofas",
    multi_size: false,
    action: "upsert",
    name: "Apollo High Back Right Aligned 3 Seater Sofa with Ottoman (Hard Cushion, Ash Grey Velvet)",
    return_config: {
      time: 7,
      returnable: true,
      unit: "days",
    },
    custom_order: {
      manufacturing_time_unit: "days",
      manufacturing_time: 0,
      is_custom_order: false,
    },
    tags: [],
    brand_uid: 283,
    description:
      "Apollo Right Aligned 3 Seater Sofa with Ottoman (Hard Cushion)",
    product_publish: {
      product_online_date: "2025-10-13T11:05:34",
      is_set: false,
    },
    is_image_less_product: false,
    item_code: "APOLLO61",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    is_set: false,
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-15T10:37:08.878000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:38.911000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLO61"],
    all_sizes: [
      {
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        seller_identifier: "APOLLO61",
        company_id: 95,
        item_length: 100,
        item_weight: 10000,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534446,
                item: {
                  item_code: "FNSF51APAG3000THAHAA",
                  slug: "apollo-high-back-back-fabric-sofa-ash-grey-velvet-ottoman-7534446",
                  name: "Apollo High Back Back Fabric Sofa (Ash Grey Velvet) Ottoman",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51APAG3000THAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      cess: 0,
                      effective_date: "2023-06-01T19:05:00",
                      threshold: 0,
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534476,
                item: {
                  item_code: "FNSF51APAG3R003HAHAA",
                  slug: "apollo-sectional-high-back-back-fabric-sofa-ash-grey-velvet-right-aligned-3-seater-7534476",
                  name: "Apollo Sectional High Back Back Fabric Sofa (Ash Grey Velvet) Right Aligned 3 Seater",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51APAG3R003HAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      effective_date: "2023-06-01T19:05:00",
                      threshold: 0,
                      rate: 18,
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534451,
                item: {
                  item_code: "FNSF51APAG3R00CHAHAA",
                  slug: "apollo-sectional-high-back-back-fabric-sofa-ash-grey-velvet-right-aligned-chaise-7534451",
                  name: "Apollo Sectional High Back Back Fabric Sofa (Ash Grey Velvet) Right Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51APAG3R00CHAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      cess: 0,
                      rate: 18,
                      effective_date: "2023-06-01T19:05:00",
                      threshold: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        size: "REGULAR",
        track_inventory: false,
        brand_uid: 283,
        identifiers: [
          {
            gtin_value: "APOLLO61",
            primary: true,
            gtin_type: "sku_code",
          },
        ],
        item_height: 100,
        price_transfer: 0,
        item_code: "APOLLO61",
        item_width: 100,
        sellable: true,
      },
    ],
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "assembly-required": "Pre Assembled",
      "sofa-material": "Fabric",
      "has-free-installation": "No",
      "back-height": "High Back",
      colour: "Ash Grey Velvet",
      "cushion-type": "Hard",
      "footrest-included": "Regular",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity":
        "Right Aligned 3 Seater + Right Aligned Chaise + Ottoman",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "273",
      "ul-rank": 319,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 299997,
            max: 299997,
          },
          effective: {
            min: 299997,
            max: 299997,
          },
        },
        seller_identifier: "APOLLO61",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "67878fd4e19145419c635a5b",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 299997,
        max: 299997,
      },
      effective: {
        min: 299997,
        max: 299997,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    item_code: "APOLLOHB20",
    custom_order: {
      manufacturing_time: 0,
      manufacturing_time_unit: "days",
      is_custom_order: false,
    },
    is_dependent: false,
    name: "Apollo High Back Compact Right Aligned 2 Seater Sofa with Ottoman (Soft Cushion, Pebble Grey)",
    uid: 7534683,
    currency: "INR",
    tags: [],
    no_of_boxes: 1,
    departments: [217],
    action: "upsert",
    brand_uid: 283,
    category_slug: "fabric-sofas",
    multi_size: false,
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    description:
      "Apollo Compact Right Aligned 2 Seater Sofa with Ottoman (Soft Cushion, Pebble Grey)",
    is_image_less_product: false,
    item_type: "standard",
    country_of_origin: "India",
    is_set: false,
    return_config: {
      time: 7,
      returnable: true,
      unit: "days",
    },
    product_publish: {
      product_online_date: "2025-10-13T11:05:34",
      is_set: false,
    },
    slug: "apollo-compact-right-aligned-2-seater-sofa-with-ottoman-soft-cushion-pebble-grey-7534683",
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-15T10:17:32.436000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:38.894000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLOHB20"],
    all_sizes: [
      {
        track_inventory: false,
        item_code: "APOLLOHB20",
        item_width: 100,
        item_height: 100,
        size: "REGULAR",
        seller_identifier: "APOLLOHB20",
        brand_uid: 283,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534525,
                item: {
                  item_code: "FNSF51ACpg3000TSAHAA",
                  slug: "apollo-compact-high-back-back-fabric-sofa-pebble-grey-ottoman-7534525",
                  name: "Apollo Compact High Back Back Fabric Sofa (Pebble Grey) Ottoman",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACPG3000TSAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      effective_date: "2023-06-01T19:05:00",
                      rate: 18,
                      threshold: 0,
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534461,
                item: {
                  item_code: "FNSF51ACpg3R002SAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-pebble-grey-right-aligned-2-seater-7534461",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Pebble Grey) Right Aligned 2 Seater",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACPG3R002SAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      effective_date: "2023-06-01T19:05:00",
                      rate: 18,
                      threshold: 0,
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534474,
                item: {
                  item_code: "FNSF51ACpg3R00CSAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-pebble-grey-right-aligned-chaise-7534474",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Pebble Grey) Right Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACPG3R00CSAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      rate: 18,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                      threshold: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        company_id: 95,
        item_length: 100,
        item_weight: 10000,
        identifiers: [
          {
            gtin_type: "sku_code",
            gtin_value: "APOLLOHB20",
            primary: true,
          },
        ],
        price_transfer: 0,
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        sellable: true,
      },
    ],
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "assembly-required": "Pre Assembled",
      "sofa-material": "Fabric",
      "has-free-installation": "No",
      "back-height": "High Back",
      colour: "Pebble Grey",
      "cushion-type": "Soft",
      "footrest-included": "Compact",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity":
        "Right Aligned 2 Seater + Right Aligned Chaise + Ottoman",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "205",
      "ul-rank": 251,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 299997,
            max: 299997,
          },
          effective: {
            min: 299997,
            max: 299997,
          },
        },
        seller_identifier: "APOLLOHB20",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "67878b3c8ff998b680633bd7",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 299997,
        max: 299997,
      },
      effective: {
        min: 299997,
        max: 299997,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    name: "Apollo High Back Compact Right Aligned 3 Seater Sofa with Ottoman (Soft Cushion, Ash Grey Velvet)",
    is_dependent: false,
    description:
      "Apollo Compact Right Aligned 3 Seater Sofa with Ottoman (Soft Cushion, Ash Grey Velvet)",
    is_set: false,
    category_slug: "fabric-sofas",
    product_publish: {
      is_set: false,
      product_online_date: "2025-10-13T11:05:34",
    },
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    departments: [217],
    country_of_origin: "India",
    tags: [],
    brand_uid: 283,
    no_of_boxes: 1,
    currency: "INR",
    item_type: "standard",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    custom_order: {
      manufacturing_time: 0,
      is_custom_order: false,
      manufacturing_time_unit: "days",
    },
    action: "upsert",
    multi_size: false,
    is_image_less_product: false,
    slug: "apollo-compact-right-aligned-3-seater-sofa-with-ottoman-soft-cushion-ash-grey-velvet-7534765",
    item_code: "APOLLO85",
    uid: 7534765,
    return_config: {
      unit: "days",
      returnable: true,
      time: 7,
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-15T10:37:12.329000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:36.391000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLO85"],
    all_sizes: [
      {
        size: "REGULAR",
        track_inventory: false,
        item_width: 100,
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        item_weight: 10000,
        identifiers: [
          {
            gtin_type: "sku_code",
            gtin_value: "APOLLO85",
            primary: true,
          },
        ],
        brand_uid: 283,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534434,
                item: {
                  item_code: "FNSF51ACAG3R003SAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-ash-grey-velvet-right-aligned-3-seater-7534434",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Ash Grey Velvet) Right Aligned 3 Seater",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3R003SAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      cess: 0,
                      effective_date: "2023-06-01T19:05:00",
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534442,
                item: {
                  item_code: "FNSF51ACAG3000TSAHAA",
                  slug: "apollo-compact-high-back-back-fabric-sofa-ash-grey-velvet-ottoman-7534442",
                  name: "Apollo Compact High Back Back Fabric Sofa (Ash Grey Velvet) Ottoman",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3000TSAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      cess: 0,
                      effective_date: "2023-06-01T19:05:00",
                      threshold: 0,
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534431,
                item: {
                  item_code: "FNSF51ACAG3R00CSAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-ash-grey-velvet-right-aligned-chaise-7534431",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Ash Grey Velvet) Right Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3R00CSAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      rate: 18,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                      threshold: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        seller_identifier: "APOLLO85",
        item_code: "APOLLO85",
        price_transfer: 0,
        item_height: 100,
        item_length: 100,
        company_id: 95,
        sellable: true,
      },
    ],
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "has-free-installation": "No",
      "sofa-material": "Fabric",
      "assembly-required": "Pre Assembled",
      "back-height": "High Back",
      colour: "Ash Grey Velvet",
      "cushion-type": "Soft",
      "footrest-included": "Compact",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity":
        "Right Aligned 3 Seater + Right Aligned Chaise + Ottoman",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "285",
      "ul-rank": 331,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 299997,
            max: 299997,
          },
          effective: {
            min: 299997,
            max: 299997,
          },
        },
        seller_identifier: "APOLLO85",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "67878fd885273d03ca435a5a",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 299997,
        max: 299997,
      },
      effective: {
        min: 299997,
        max: 299997,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    name: "Apollo High Back Compact Left Aligned 3 Seater Sofa with Ottoman (Hard Cushion, Ash Grey Velvet)",
    is_dependent: false,
    description:
      "Apollo Compact Left Aligned 3 Seater Sofa with Ottoman (Hard Cushion, Ash Grey Velvet)",
    is_set: false,
    category_slug: "fabric-sofas",
    product_publish: {
      is_set: false,
      product_online_date: "2025-10-13T11:05:34",
    },
    net_quantity: {
      value: 1,
      unit: "nos",
    },
    departments: [217],
    country_of_origin: "India",
    tags: [],
    brand_uid: 283,
    no_of_boxes: 1,
    currency: "INR",
    item_type: "standard",
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        type: "image",
      },
    ],
    custom_order: {
      manufacturing_time: 0,
      is_custom_order: false,
      manufacturing_time_unit: "days",
    },
    action: "upsert",
    multi_size: false,
    is_image_less_product: false,
    slug: "apollo-compact-left-aligned-3-seater-sofa-with-ottoman-hard-cushion-ash-grey-velvet-7534749",
    item_code: "APOLLO92",
    uid: 7534749,
    return_config: {
      unit: "days",
      returnable: true,
      time: 7,
    },
    template_tag: "fabric-sofas",
    category_uid: 1874,
    variants: {
      "back-height": "APOLLOHB8",
      colour: "APOLLOHB8",
      "seating-capacity": "APOLLOHB8",
      "cushion-type": "APOLLOHB8",
      "footrest-included": "APOLLOHB8",
    },
    created_on: "2025-01-15T10:37:13.337000",
    created_by: {
      username: "65fa870c0c70154710e9a830",
      user_id: "72a8f42e3de989cd03a5086c",
      super_user: false,
    },
    modified_on: "2025-10-13T11:05:35.587000",
    modified_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: true,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["APOLLO92"],
    all_sizes: [
      {
        size: "REGULAR",
        track_inventory: false,
        item_width: 100,
        price: {
          marked: {
            min: 99999,
            max: 99999,
          },
          effective: {
            min: 99999,
            max: 99999,
          },
        },
        item_weight: 10000,
        identifiers: [
          {
            gtin_type: "sku_code",
            gtin_value: "APOLLO92",
            primary: true,
          },
        ],
        brand_uid: 283,
        _custom_json: {
          combo: {
            products: [
              {
                isHero: true,
                quantity: 1,
                uid: 7534423,
                item: {
                  item_code: "FNSF51ACAG3000THAHAA",
                  slug: "apollo-compact-high-back-back-fabric-sofa-ash-grey-velvet-ottoman-7534423",
                  name: "Apollo Compact High Back Back Fabric Sofa (Ash Grey Velvet) Ottoman",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3000THAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      threshold: 0,
                      cess: 0,
                      effective_date: "2023-06-01T19:05:00",
                      rate: 18,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534445,
                item: {
                  item_code: "FNSF51ACAG3L003HAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-ash-grey-velvet-left-aligned-3-seater-7534445",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Ash Grey Velvet) Left Aligned 3 Seater",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3L003HAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      rate: 18,
                      threshold: 0,
                      effective_date: "2023-06-01T19:05:00",
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
              {
                isHero: false,
                quantity: 1,
                uid: 7534460,
                item: {
                  item_code: "FNSF51ACAG3L00CHAHAA",
                  slug: "apollo-sectional-compact-high-back-back-fabric-sofa-ash-grey-velvet-left-aligned-chaise-7534460",
                  name: "Apollo Sectional Compact High Back Back Fabric Sofa (Ash Grey Velvet) Left Aligned Chaise",
                  attributes: {
                    identifier: {
                      sku_code: ["FNSF51ACAG3L00CHAHAA"],
                      ean: [],
                    },
                  },
                  taxes: [
                    {
                      effective_date: "2023-06-01T19:05:00",
                      threshold: 0,
                      rate: 18,
                      cess: 0,
                    },
                  ],
                  hsn_code: "94036000",
                  brand_name: "Urban Ladder",
                  store_wise_price_and_expiry: {
                    60: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                    254: {
                      price_marked: 99999,
                      price_effective: 99999,
                      expiration_date: "9998-01-30T23:59:00",
                    },
                  },
                },
              },
            ],
          },
        },
        seller_identifier: "APOLLO92",
        item_code: "APOLLO92",
        price_transfer: 0,
        item_height: 100,
        item_length: 100,
        company_id: 95,
        sellable: true,
      },
    ],
    _custom_json: {},
    highlights: [],
    short_description: "",
    size_guide: "",
    teaser_tag: {},
    variant_media: {},
    category_name: "Fabric Sofas",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "669663c60dda577e72ca0cd6",
      reporting_hsn: "94031090H1",
      hsn_code: "94031090",
    },
    attributes: {
      "has-free-installation": "No",
      "sofa-material": "Fabric",
      "assembly-required": "Pre Assembled",
      "cushion-type": "Hard",
      "footrest-included": "Compact",
      "back-height": "High Back",
      colour: "Ash Grey Velvet",
      "primary-material-subtype": "Polyester",
      "primary-material-type": "Fabric",
      "seating-capacity":
        "Left Aligned 3 Seater + Left Aligned Chaise + Ottoman",
      "storage-included": "Without Storage",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "287",
      "ul-rank": 333,
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 1,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 299997,
            max: 299997,
          },
          effective: {
            min: 299997,
            max: 299997,
          },
        },
        seller_identifier: "APOLLO92",
        price_transfer: 0,
        track_inventory: false,
      },
    ],
    id: "67878fd985273d03ca435a60",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSF51HGBR30003/2c37XkOFyn-FNSF51HGBR3_-_LP.png",
      },
    ],
    price: {
      marked: {
        min: 299997,
        max: 299997,
      },
      effective: {
        min: 299997,
        max: 299997,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "669663c60dda577e72ca0cd6",
  },
  {
    is_dependent: false,
    uid: 7502111,
    item_type: "standard",
    custom_order: {
      manufacturing_time: 0,
      manufacturing_time_unit: "days",
      is_custom_order: false,
    },
    product_publish: {
      product_online_date: "2025-10-10T04:17:03",
      is_set: false,
    },
    departments: [217],
    action: "upsert",
    no_of_boxes: 1,
    is_set: false,
    slug: "bardot-lounge-chair-tuscan-red-velvet-7502111",
    brand_uid: 283,
    item_code: "FNSTLC51RV15605",
    country_of_origin: "India",
    tags: ["product_set_lounge"],
    currency: "INR",
    name: "Bardot Lounge Chair - Tuscan Red Velvet",
    return_config: {
      unit: "days",
      returnable: true,
      time: 7,
    },
    multi_size: true,
    is_image_less_product: false,
    category_slug: "lounge-chairs",
    template_tag: "lounge-chairs",
    category_uid: 1871,
    variants: {},
    created_on: "2024-03-19T06:01:07.615000",
    created_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: false,
    },
    modified_on: "2025-10-10T04:17:05.229000",
    modified_by: {
      username: "mohammed_fayaz_urbanladder_com_85128",
      user_id: "a93bbaa6c599b346ce6e0ce7",
      super_user: false,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["FNSTLC51RV15605"],
    all_sizes: [
      {
        item_length: 78.4,
        price: {
          marked: {
            min: 196100,
            max: 196100,
          },
          effective: {
            min: 196100,
            max: 196100,
          },
        },
        company_id: 95,
        identifiers: [
          {
            gtin_type: "sku_code",
            primary: true,
            gtin_value: "FNSTLC51RV15605",
          },
        ],
        item_weight: 8600,
        item_width: 55.8,
        brand_uid: 283,
        item_code: "FNSTLC51RV15605",
        price_transfer: 0,
        item_height: 60.9,
        size: "REGULAR",
        seller_identifier: "FNSTLC51RV15605",
        track_inventory: true,
        _custom_json: {},
        sellable: true,
      },
    ],
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/SZWPCgQ2R-FNSTCH33DG31001_1.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/mPx21qsAsm-FNSTCH33DG31001_2.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/wzta5jL5Fd-FNSTCH33DG31001_3.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/tTNN6S-KYX-FNSTCH33DG31001_4.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/TX6cN1MOlG-FNSTCH33DG31001_LP.jpg",
        type: "image",
      },
    ],
    _custom_json: {},
    description: "",
    highlights: [],
    "mirror-included": "True",
    net_quantity: {},
    "no-of-doors": "2",
    "no-of-shelves": "3",
    short_description: "",
    size_guide: "",
    teaser_tag: {},
    variant_media: {},
    category_name: "Lounge Chairs",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "649184195ea831241afd2431",
      reporting_hsn: "9024090H1",
      hsn_code: "9024090",
    },
    attributes: {
      "upholstery-material": "Leatherette",
      warranty:
        "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
      "is-upholstered": "True",
      "primary-material-type": "Engineered Wood",
      "assembly-required": "Pre Assembled",
      returns:
        '<ul> <li>We offer cancellations until the product is Shipped. Returns within 7 days of the delivery are eligible for damaged or defective products. To know more please refer to&nbsp;<a href="https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer">Returns Policy</a></li> <li><strong>Note: </strong>Please do not unbox or assemble the product yourself. Cancellations/ Returns/ Warranty will be void if not unboxed or assembled by Urban Ladder authorized furniture experts.</li> <li>For products purchased with a trial period, eligibility for return within that trial period would be that the product would need to be clean and free from any damages along with the availability of the complete original packaging material.</li> <!-- <li>This product qualifies for a full refund until delivery/installation (as applicable). Post-delivery/installation (as applicable), you will be charged 100% of the&nbsp;product value&nbsp;on cancellation.</li> --> <!-- <li>This product comes with zero cancellation charges, until the time of delivery.</li> <li>Please check the product at the time of delivery. If it is not to your liking or is damaged/defective, you can return it on the spot. Post-delivery, only After Sales services are applicable.</li> <li>On the off-chance that a defect appears in the product after it is delivered, please reach us on hello@urbanladder.com or 080-46666777. We will assess the damage and get back to you with a solution as soon as we can.</li> <li>Please note that the above policies do not apply to all pincodes. To see our return policy for your location, enter your pincode in the box above.</li> <li>You can read our complete terms of sale&nbsp;<span style="color: #0000ff;"><a href="https://www.urbanladder.com/terms-of-offer-for-sale">here</a></span></li> ---></ul>',
      "primary-material-subtype": "Beech Wood",
      "quality-promise":
        "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
      "has-free-installation": "False",
      "care-instruction":
        '"<!--<ul> <li>The product comes with a 12 month warranty against any manufacturing defects and any other issues with the materials that have been used.</li> <li>The warranty does not cover damages due to usage of the product beyond its intended use and wear &amp; tear in the natural course of product usage.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li>Termite & Fungus will not be covered under the warranty.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minute difference in fabric color and wood finish between the images here and the actual product. This is caused by the difference in screen calibrations and resolutions across different displays.</strong></li> <li><strong>It is acceptable to have a slight mismatch in dimensions up to 12mm in upholstered products and up to 6mm in non upholstered.</strong></li> <li><strong>Our products are designed for residential use only hence warranty will be void outside residential use</strong></li> </ul>--> <ul> <li>This product comes with a 12 months warranty against manufacturing defects.</li> <li>Fabrics, leatherettes and leathers, if used, will not be covered by the above Warranty. Only our Luxe range of fabrics will be covered under 36 months warranty.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li><a href=""https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer"">Click here</a> to read the complete Warranty policy.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minimal variation in color and finish of the products sold from time to time</strong></li> <li><strong>There can be a minimal variation in dimensions up to 12mm in upholstered products and up to 6mm in non-upholstered products.</strong></li> <li><strong>Our products are designed for the sole purpose of residential usage, hence any usage beyond this will lead to a void of warranty.</strong></li> <li><strong>Termite &amp; Fungus will not be covered under the warranty.</strong></li> <li><strong>Please note that this warranty does not extend to electrical components.</strong></li> </ul>"',
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 2,
        sellable_quantity: 281,
        sellable: true,
        price: {
          marked: {
            min: 196100,
            max: 196100,
          },
          effective: {
            min: 196100,
            max: 196100,
          },
        },
        seller_identifier: "FNSTLC51RV15605",
        price_transfer: 0,
        track_inventory: true,
      },
    ],
    id: "65f92a23ac58ce27cd7cc192",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/SZWPCgQ2R-FNSTCH33DG31001_1.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/SZWPCgQ2R-FNSTCH33DG31001_1.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/mPx21qsAsm-FNSTCH33DG31001_2.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/mPx21qsAsm-FNSTCH33DG31001_2.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/wzta5jL5Fd-FNSTCH33DG31001_3.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/wzta5jL5Fd-FNSTCH33DG31001_3.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/tTNN6S-KYX-FNSTCH33DG31001_4.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/tTNN6S-KYX-FNSTCH33DG31001_4.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/TX6cN1MOlG-FNSTCH33DG31001_LP.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTLC51RV15605/TX6cN1MOlG-FNSTCH33DG31001_LP.jpg",
      },
    ],
    price: {
      marked: {
        min: 196100,
        max: 196100,
      },
      effective: {
        min: 196100,
        max: 196100,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "649184195ea831241afd2431",
  },
  {
    departments: [217],
    uid: 7502062,
    tags: [],
    is_image_less_product: false,
    name: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
    brand_uid: 283,
    no_of_boxes: 1,
    action: "upsert",
    currency: "INR",
    is_dependent: false,
    product_publish: {
      product_online_date: "2025-10-09T06:51:02",
      is_set: false,
    },
    return_config: {
      unit: "days",
      returnable: true,
      time: 7,
    },
    category_slug: "dining-chairs",
    multi_size: true,
    item_code: "FNSTCH15BE30180",
    custom_order: {
      manufacturing_time: 0,
      manufacturing_time_unit: "days",
      is_custom_order: false,
    },
    country_of_origin: "India",
    is_set: false,
    item_type: "standard",
    slug: "dalla-dining-chairs-set-of-2-colour-beige-7502062",
    template_tag: "dining-chair",
    category_uid: 1873,
    variants: {},
    created_on: "2024-03-19T05:54:23.122000",
    created_by: {
      username: "mudassir_mannanaik_urbanladder_com_86003",
      user_id: "95eecf4c99af22960a06c703",
      super_user: false,
    },
    modified_on: "2025-10-09T06:51:02.976000",
    modified_by: {
      username: "mohammed_fayaz_urbanladder_com_85128",
      user_id: "a93bbaa6c599b346ce6e0ce7",
      super_user: false,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["FNSTCH15BE30180"],
    all_sizes: [
      {
        item_width: 44.958,
        brand_uid: 283,
        item_weight: 17950,
        company_id: 95,
        size: "REGULAR",
        item_height: 54.102,
        track_inventory: true,
        identifiers: [
          {
            primary: true,
            gtin_value: "FNSTCH15BE30180",
            gtin_type: "sku_code",
          },
        ],
        item_code: "FNSTCH15BE30180",
        item_length: 86.106,
        seller_identifier: "FNSTCH15BE30180",
        price: {
          marked: {
            min: 1500000,
            max: 1500000,
          },
          effective: {
            min: 800000,
            max: 800000,
          },
        },
        price_transfer: 0,
        _custom_json: {},
        sellable: true,
      },
    ],
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/N3ZKDtzk7l-FNSTDC62MB15782_1.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/sZ04Msf3_G-FNSTDC62MB15782_2.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/Y-qPxPaVlO-FNSTDC62MB15782_3.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/YqUZtxU6v-FNSTDC62MB15782_4.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/BKY8j5ad3O-FNSTDC62MB15782_5.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/RS--1rpBja-FNSTDC62MB15782_6.jpg",
        type: "image",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/6A_F6ac1T8-FNSTDC62MB15782_LP.jpg",
        type: "image",
      },
    ],
    _custom_json: {},
    description: "",
    highlights: [],
    net_quantity: {},
    short_description: "",
    size_guide: "",
    teaser_tag: {},
    variant_media: {},
    category_name: "Dining Chairs",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "649184175ea831241afd242b",
      reporting_hsn: "9011129H1",
      hsn_code: "9011129",
    },
    attributes: {
      "primary-material-type": "Solid Wood",
      "care-instruction":
        '"<!--<ul> <li>The product comes with a 12 month warranty against any manufacturing defects and any other issues with the materials that have been used.</li> <li>The warranty does not cover damages due to usage of the product beyond its intended use and wear &amp; tear in the natural course of product usage.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li>Termite & Fungus will not be covered under the warranty.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minute difference in fabric color and wood finish between the images here and the actual product. This is caused by the difference in screen calibrations and resolutions across different displays.</strong></li> <li><strong>It is acceptable to have a slight mismatch in dimensions up to 12mm in upholstered products and up to 6mm in non upholstered.</strong></li> <li><strong>Our products are designed for residential use only hence warranty will be void outside residential use</strong></li> </ul>--> <ul> <li>This product comes with a 12 months warranty against manufacturing defects.</li> <li>Fabrics, leatherettes and leathers, if used, will not be covered by the above Warranty. Only our Luxe range of fabrics will be covered under 36 months warranty.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li><a href=""https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer"">Click here</a> to read the complete Warranty policy.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minimal variation in color and finish of the products sold from time to time</strong></li> <li><strong>There can be a minimal variation in dimensions up to 12mm in upholstered products and up to 6mm in non-upholstered products.</strong></li> <li><strong>Our products are designed for the sole purpose of residential usage, hence any usage beyond this will lead to a void of warranty.</strong></li> <li><strong>Termite &amp; Fungus will not be covered under the warranty.</strong></li> <li><strong>Please note that this warranty does not extend to electrical components.</strong></li> </ul>"',
      warranty:
        "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
      "assembly-required": "Requires Assembly",
      "upholstery-material": "Leatherette",
      "primary-material-subtype": "Teak Wood",
      returns:
        '<ul> <li>We offer cancellations until the product is Shipped. Returns within 7 days of the delivery are eligible for damaged or defective products. To know more please refer to&nbsp;<a href="https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer">Returns Policy</a></li> <li><strong>Note: </strong>Please do not unbox or assemble the product yourself. Cancellations/ Returns/ Warranty will be void if not unboxed or assembled by Urban Ladder authorized furniture experts.</li> <li>For products purchased with a trial period, eligibility for return within that trial period would be that the product would need to be clean and free from any damages along with the availability of the complete original packaging material.</li> <!-- <li>This product qualifies for a full refund until delivery/installation (as applicable). Post-delivery/installation (as applicable), you will be charged 100% of the&nbsp;product value&nbsp;on cancellation.</li> --> <!-- <li>This product comes with zero cancellation charges, until the time of delivery.</li> <li>Please check the product at the time of delivery. If it is not to your liking or is damaged/defective, you can return it on the spot. Post-delivery, only After Sales services are applicable.</li> <li>On the off-chance that a defect appears in the product after it is delivered, please reach us on hello@urbanladder.com or 080-46666777. We will assess the damage and get back to you with a solution as soon as we can.</li> <li>Please note that the above policies do not apply to all pincodes. To see our return policy for your location, enter your pincode in the box above.</li> <li>You can read our complete terms of sale&nbsp;<span style="color: #0000ff;"><a href="https://www.urbanladder.com/terms-of-offer-for-sale">here</a></span></li> ---></ul>',
      "quality-promise":
        "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
      "ul-premium-space": "6",
    },
    sizes: [
      {
        size: "REGULAR",
        store_count: 3,
        sellable_quantity: 8,
        sellable: true,
        price: {
          marked: {
            min: 1500000,
            max: 1500000,
          },
          effective: {
            min: 800000,
            max: 800000,
          },
        },
        seller_identifier: "FNSTCH15BE30180",
        price_transfer: 0,
        track_inventory: true,
      },
    ],
    id: "65f9288f3e9f1d68789a4de7",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/N3ZKDtzk7l-FNSTDC62MB15782_1.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/N3ZKDtzk7l-FNSTDC62MB15782_1.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/sZ04Msf3_G-FNSTDC62MB15782_2.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/sZ04Msf3_G-FNSTDC62MB15782_2.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/Y-qPxPaVlO-FNSTDC62MB15782_3.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/Y-qPxPaVlO-FNSTDC62MB15782_3.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/YqUZtxU6v-FNSTDC62MB15782_4.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/YqUZtxU6v-FNSTDC62MB15782_4.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/BKY8j5ad3O-FNSTDC62MB15782_5.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/BKY8j5ad3O-FNSTDC62MB15782_5.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/RS--1rpBja-FNSTDC62MB15782_6.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/RS--1rpBja-FNSTDC62MB15782_6.jpg",
      },
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/6A_F6ac1T8-FNSTDC62MB15782_LP.jpg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/6A_F6ac1T8-FNSTDC62MB15782_LP.jpg",
      },
    ],
    price: {
      marked: {
        min: 1500000,
        max: 1500000,
      },
      effective: {
        min: 800000,
        max: 800000,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "649184175ea831241afd242b",
  },
  {
    media: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/5AglwGxHC-Apollo-Left-Aligned-3-Seater-Sofa.jpeg",
        type: "image",
      },
    ],
    net_quantity: {},
    is_dependent: false,
    category_slug: "coffee-tables",
    is_image_less_product: false,
    custom_order: {
      manufacturing_time: 14,
      manufacturing_time_unit: "days",
      is_custom_order: true,
    },
    return_config: {
      unit: "days",
      returnable: true,
      time: 7,
    },
    no_of_boxes: 1,
    name: "MTO - Winchester 3 Seater Fabric Sofa By Fayaz",
    item_code: "FAYAZMTO001",
    is_set: false,
    highlights: [],
    short_description: "",
    departments: [217],
    product_publish: {
      product_online_date: "2025-10-09T06:30:35",
      is_set: false,
    },
    tags: ["combo"],
    brand_uid: 283,
    description: "MTO",
    variant_media: {},
    currency: "INR",
    _custom_json: {},
    item_type: "standard",
    teaser_tag: {},
    country_of_origin: "India",
    multi_size: false,
    uid: 7563253,
    size_guide: "",
    slug: "mto-winchester-3-seater-fabric-sofa-by-fayaz-7563253",
    template_tag: "coffee-tables",
    category_uid: 1868,
    variants: {},
    created_on: "2025-07-14T10:39:03.482000",
    created_by: {
      username: "mohammed_fayaz_urbanladder_com_85128",
      user_id: "a93bbaa6c599b346ce6e0ce7",
      super_user: false,
    },
    modified_on: "2025-10-09T06:30:35.766000",
    modified_by: {
      username: "mohammed_fayaz_urbanladder_com_85128",
      user_id: "a93bbaa6c599b346ce6e0ce7",
      super_user: false,
    },
    stage: "pending",
    all_company_ids: [95],
    all_identifiers: ["FAYAZMTO001"],
    all_sizes: [
      {
        price_transfer: 0,
        item_height: 35,
        seller_identifier: "FAYAZMTO001",
        item_weight: 35000,
        identifiers: [
          {
            primary: true,
            gtin_value: "FAYAZMTO001",
            gtin_type: "sku_code",
          },
        ],
        company_id: 95,
        item_code: "FAYAZMTO001",
        size: "OS",
        brand_uid: 283,
        _custom_json: {},
        item_width: 60,
        item_length: 90,
        track_inventory: true,
        price: {
          marked: {
            min: 400000,
            max: 400000,
          },
          effective: {
            min: 200000,
            max: 200000,
          },
        },
        sellable: true,
      },
    ],
    action: "upsert",
    category_name: "Coffee Tables",
    is_active: true,
    tax_identifier: {
      hsn_code_id: "649184175ea831241afd242b",
      reporting_hsn: "9011129H1",
      hsn_code: "9011129",
    },
    attributes: {
      warranty:
        "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
      "assembly-required": "Pre Assembled",
      "storage-included": "Without Storage",
      "wheels-included": "FALSE",
      "primary-material-type": "Solid Wood",
      "no-of-shelves": "two",
      "has-free-installation": "Yes",
      "primary-material-subtype": "Sheesham Wood",
      "table-shape": "Rectangle",
      "storage-type": "Non Storage",
      "finish-type": "Polished",
      "care-instruction":
        '"<!--<ul> <li>The product comes with a 12 month warranty against any manufacturing defects and any other issues with the materials that have been used.</li> <li>The warranty does not cover damages due to usage of the product beyond its intended use and wear &amp; tear in the natural course of product usage.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li>Termite & Fungus will not be covered under the warranty.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minute difference in fabric color and wood finish between the images here and the actual product. This is caused by the difference in screen calibrations and resolutions across different displays.</strong></li> <li><strong>It is acceptable to have a slight mismatch in dimensions up to 12mm in upholstered products and up to 6mm in non upholstered.</strong></li> <li><strong>Our products are designed for residential use only hence warranty will be void outside residential use</strong></li> </ul>--> <ul> <li>This product comes with a 12 months warranty against manufacturing defects.</li> <li>Fabrics, leatherettes and leathers, if used, will not be covered by the above Warranty. Only our Luxe range of fabrics will be covered under 36 months warranty.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li><a href=""https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer"">Click here</a> to read the complete Warranty policy.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minimal variation in color and finish of the products sold from time to time</strong></li> <li><strong>There can be a minimal variation in dimensions up to 12mm in upholstered products and up to 6mm in non-upholstered products.</strong></li> <li><strong>Our products are designed for the sole purpose of residential usage, hence any usage beyond this will lead to a void of warranty.</strong></li> <li><strong>Termite &amp; Fungus will not be covered under the warranty.</strong></li> <li><strong>Please note that this warranty does not extend to electrical components.</strong></li> </ul>"',
      "primary-color": "Blue",
      "no-of-drawers": "one",
      "quality-promise":
        "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
      returns:
        '<ul> <li>We offer cancellations until the product is Shipped. Returns within 7 days of the delivery are eligible for damaged or defective products. To know more please refer to&nbsp;<a href="https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer">Returns Policy</a></li> <li><strong>Note: </strong>Please do not unbox or assemble the product yourself. Cancellations/ Returns/ Warranty will be void if not unboxed or assembled by Urban Ladder authorized furniture experts.</li> <li>For products purchased with a trial period, eligibility for return within that trial period would be that the product would need to be clean and free from any damages along with the availability of the complete original packaging material.</li> <!-- <li>This product qualifies for a full refund until delivery/installation (as applicable). Post-delivery/installation (as applicable), you will be charged 100% of the&nbsp;product value&nbsp;on cancellation.</li> --> <!-- <li>This product comes with zero cancellation charges, until the time of delivery.</li> <li>Please check the product at the time of delivery. If it is not to your liking or is damaged/defective, you can return it on the spot. Post-delivery, only After Sales services are applicable.</li> <li>On the off-chance that a defect appears in the product after it is delivered, please reach us on hello@urbanladder.com or 080-46666777. We will assess the damage and get back to you with a solution as soon as we can.</li> <li>Please note that the above policies do not apply to all pincodes. To see our return policy for your location, enter your pincode in the box above.</li> <li>You can read our complete terms of sale&nbsp;<span style="color: #0000ff;"><a href="https://www.urbanladder.com/terms-of-offer-for-sale">here</a></span></li> ---></ul>',
      "ul-premium-space": "27",
      "ul-rank": 1,
    },
    sizes: [
      {
        size: "OS",
        store_count: 2,
        sellable_quantity: 0,
        sellable: false,
        price: {
          marked: {
            min: 400000,
            max: 400000,
          },
          effective: {
            min: 200000,
            max: 200000,
          },
        },
        seller_identifier: "FAYAZMTO001",
        price_transfer: 0,
        track_inventory: true,
      },
    ],
    id: "6874de47ad50557ee7fc203a",
    brand: {
      name: "Urban Ladder",
      logo: {
        aspect_ratio: "1:1",
        aspect_ratio_f: 1,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:50)/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
      },
      uid: 283,
    },
    images: [
      {
        aspect_ratio: "16:25",
        aspect_ratio_f: 0.64,
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/5AglwGxHC-Apollo-Left-Aligned-3-Seater-Sofa.jpeg",
        secure_url:
          "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/t.resize(w:135)/swadeshz5/products/pictures/item/free/original/5AglwGxHC-Apollo-Left-Aligned-3-Seater-Sofa.jpeg",
      },
    ],
    price: {
      marked: {
        min: 400000,
        max: 400000,
      },
      effective: {
        min: 200000,
        max: 200000,
      },
    },
    status: "pending",
    is_expirable: false,
    hsn_code: "649184175ea831241afd242b",
  },
];

const mockCategoryAttributesMapping = {
  product_tag: {
    sofa: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      category_name: "Sofa",
      tag_type: "PRODUCT_TAG",
      attributes: ["product_name", "price", "height", "width"],
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
    chair: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      category_name: "Chair",
      tag_type: "PRODUCT_TAG",
      attributes: ["product_name", "price"],
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
  },
  product_talker: {
    sofa: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      category_name: "Sofa",
      tag_type: "PRODUCT_TALKER",
      attributes: ["height", "width"],
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
    dining: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      category_name: "dining",
      tag_type: "PRODUCT_TALKER",
      attributes: ["height", "width"],
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
  },
};

const mockTemplateMapping = {
  product_tag: {
    basic: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      template_name: "basic",
      tag_type: "PRODUCT_TAG",
      template_html: "<div>{{product_name}} - {{price}}</div>",
      max_tags_per_page: 3,
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
    premium: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      template_name: "premium",
      tag_type: "PRODUCT_TAG",
      template_html: "<div>{{product_name}} - {{price}}</div>",
      max_tags_per_page: 3,
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
    regular: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      template_name: "regular",
      tag_type: "PRODUCT_TAG",
      template_html: "<div>{{product_name}} - {{price}}</div>",
      max_tags_per_page: 3,
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
  },
  product_talker: {
    talker_basic: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      template_name: "talker_basic",
      tag_type: "PRODUCT_TALKER",
      template_html: "<div>{{product_name}} - {{price}}</div>",
      max_tags_per_page: 3,
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
    talker_regular: {
      _id: {},
      company_id: "95",
      application_id: "65eb1972926345654bc9c1a8",
      template_name: "talker_regular",
      tag_type: "PRODUCT_TALKER",
      template_html: "<div>{{product_name}} - {{price}}</div>",
      max_tags_per_page: 3,
      createdAt: "2025-10-14T09:14:40.268Z",
      updatedAt: "2025-10-14T09:14:40.268Z",
    },
  },
};

const mockDiningData = {
  product_details: {
    type: "product",
    grouped_attributes: [
      {
        title: "Properties",
        details: [
          {
            key: "Furniture Assembly",
            type: "text",
            value: "Pre Assembled",
          },
          {
            key: "Seating Capacity",
            type: "text",
            value: "3 Seater",
          },
          {
            key: "Sofa Material",
            type: "text",
            value: "Fabric",
          },
          {
            key: "Colour",
            type: "text",
            value: "Pearl",
          },
          {
            key: "Has Free Installation",
            type: "text",
            value: "No",
          },
          {
            key: "Brand",
            type: "text",
            value: "Urban Ladder Create",
          },
          {
            key: "Item Code",
            type: "text",
            value: "FNSF51ABPL30003",
          },
          {
            key: "Country of Origin",
            type: "text",
            value: "India",
          },
        ],
      },
    ],
    medias: [
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
      {
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
        type: "image",
        alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      },
    ],
    department: {
      name: "UL Furniture",
      uid: 217,
      logo: {
        type: "image",
        url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/department/pictures/square-logo/original/cxi5AGTq3-department.jpeg",
      },
      slug: "ul-furniture",
    },
    uid: 7534324,
    item_code: "FNSF51ABPL30003",
    slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
    attributes: {
      "assembly-required": "Pre Assembled",
      "seating-capacity": "3 Seater",
      "sofa-material": "Fabric",
      colour: "Pearl",
      "has-free-installation": "No",
      "grouping-attribute": "Yes",
      "show-on-plp": "Yes",
      "ul-premium-space": "27",
      "ul-rank": 73,
      product_details: "Fabric",
      short_description: "",
      brand_name: "Urban Ladder Create",
      item_code: "FNSF51ABPL30003",
      country_of_origin: "India",
      image_nature: "standard",
      l3_category_names: ["Fabric Sofas"],
      discount: 42,
      brand: "Urban Ladder Create",
      departments: "UL Furniture",
      is_custom_order: true,
      min_price_effective: 44485,
      is_set: false,
      size_depth: 0,
      is_available: false,
    },
    name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
    has_variant: true,
    categories: [
      {
        uid: 1874,
        name: "Fabric Sofas",
        logo: {
          type: "image",
          url: "https://hdn-1.fynd.com/media/banner_portrait/brand/original/540_ecba3a1af141467da8abc20500f983db.jpg",
        },
        action: {
          page: {
            type: "products",
            query: {
              category: ["fabric-sofas"],
            },
          },
          type: "page",
        },
        _custom_json: {},
      },
    ],
    category_map: {
      l1: {
        uid: 1858,
        name: "Living Room.",
        logo: {
          type: "image",
          url: "https://hdn-1.fynd.com/media/banner_portrait/brand/original/540_ecba3a1af141467da8abc20500f983db.jpg",
        },
        action: {
          page: {
            type: "products",
            query: {
              category: ["living-room1"],
            },
          },
          type: "page",
        },
        _custom_json: {},
      },
      l2: {
        uid: 1866,
        name: "Sofas",
        logo: {
          type: "image",
          url: "https://hdn-1.fynd.com/media/banner_portrait/brand/original/540_ecba3a1af141467da8abc20500f983db.jpg",
        },
        action: {
          page: {
            type: "products",
            query: {
              category: ["sofas"],
            },
          },
          type: "page",
        },
        _custom_json: {},
      },
      l3: {
        uid: 1874,
        name: "Fabric Sofas",
        logo: {
          type: "image",
          url: "https://hdn-1.fynd.com/media/banner_portrait/brand/original/540_ecba3a1af141467da8abc20500f983db.jpg",
        },
        action: {
          page: {
            type: "products",
            query: {
              category: ["fabric-sofas"],
            },
          },
          type: "page",
        },
        _custom_json: {},
      },
    },
    tryouts: [],
    promo_meta: {},
    rating: 0,
    rating_count: 0,
    image_nature: "standard",
    tags: [],
    teaser_tag: "",
    no_of_boxes: 1,
    custom_order: {
      manufacturing_time: 9,
      manufacturing_time_unit: "days",
      is_custom_order: true,
    },
    _custom_json: {
      _app: {},
    },
    _custom_meta: [],
    is_dependent: false,
    moq: {
      minimum: 1,
      increment_unit: 1,
    },
    seo: {
      title: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
      description: "",
    },
    net_quantity: {},
    item_type: "standard",
    highlights: [],
    description: "Fabric",
    short_description: "",
    country_of_origin: "India",
    similars: [],
    brand: {
      name: "Urban Ladder Create",
      uid: 448,
      logo: {
        type: "image",
        url: "https://cdn.swadeshonline.com/v2/patient-paper-41f385/swad-p/wrkr/brands/pictures/square-logo/original/d_9a0Pbsj-Logo.jpeg",
      },
      action: {
        page: {
          type: "products",
          query: {
            brand: ["urban-ladder-create"],
          },
        },
        type: "page",
      },
      _custom_json: {},
      description: "",
    },
    error: null,
    loading: false,
  },
  product_variants: {
    variants: [
      {
        logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/popular.png",
        items: [
          {
            uid: 7534326,
            _custom_meta: [],
            slug: "adelaide-essential-1-seater-fabric-sofa-pearl-7534326",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/zz5K5ekL25b-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/w5PMR1vtr7V-FNSF51ABPL3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/lx4o2TSy5F9-FNSF51ABPL3_-_main_13.png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/Wlr9Z9zt2gn-FNSF51ABPL3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/f6CWzmIuBkE-FNSF51ABPL3_-_main_50.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/r8COhHEWVwf-FNSF51ABPL3_-_main_6.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/GzRJpoe47hV-FNSF51ABPL3_-_main_7.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/0l4KXyZFtjz-FNSF51ABPL3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/s4of7v6c5R6-FNSF51ABPL3_-_main_9.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/7rZymyDg9Yf-Product_Dimensions-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 1 Seater Fabric Sofa (Pearl)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-1-seater-fabric-sofa-pearl-7534326",
                  ],
                },
              },
              type: "page",
            },
            value: "1 Seater",
          },
          {
            uid: 7534338,
            _custom_meta: [],
            slug: "adelaide-essential-2-seater-fabric-sofa-pearl-7534338",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/zflwp-fnoCA-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/q878lIaYDqv-FNSF51ABPL3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/y4koKNKMup4-FNSF51ABPL3_-_main_12.png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/9p0y4NfvPE_-FNSF51ABPL3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/nbZKZAnuTpo-FNSF51ABPL3_-_main_4.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/cGQ4mbMcdZJ-FNSF51ABPL3_-_main_5.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/lXBWWg23Zcj-FNSF51ABPL3_-_main_50.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/07UM_rSVrgZ-FNSF51ABPL3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/xNkmyTZQYX_-FNSF51ABPL3_-_main_9.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/ZvFBmx5dfC2-Product_Dimensions2s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 2 Seater Fabric Sofa (Pearl)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-2-seater-fabric-sofa-pearl-7534338",
                  ],
                },
              },
              type: "page",
            },
            value: "2 Seater",
          },
          {
            uid: 7534324,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                  ],
                },
              },
              type: "page",
            },
            value: "3 Seater",
          },
        ],
        group_id: "Adelaide-Essential",
        display_type: "text",
        header: "Seating Capacity",
        key: "seating-capacity",
      },
      {
        logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
        items: [
          {
            uid: 7534320,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/uwqW-PBGdw-01.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/PNzRkeYB-w-02.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/BAWOsfxtV1-03.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/ipGWJtlu_Y-04.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/CMQRRmvVDL-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/h35K_ds-rI-FNSF51ABDC3_-_main_5.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/yrpdBo39xt-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Daschund Brown)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320",
                  ],
                },
              },
              type: "page",
            },
            value: "Daschund Brown",
          },
          {
            uid: 7534324,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                  ],
                },
              },
              type: "page",
            },
            value: "Pearl",
          },
          {
            uid: 7534328,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/w8_gpHEsK0-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/jgpmLIJU4e-FNSF51ABSA3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/jg5RdqAFLf-FNSF51ABSA3_-_main_2.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/11QUd3k-Ci-FNSF51ABSA3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/nu04Dv0AGc-FNSF51ABSA3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/gnn-QbZFeS-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Salsa Red)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328",
                  ],
                },
              },
              type: "page",
            },
            value: "Salsa Red",
          },
          {
            uid: 7534336,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-steel-7534336",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/9he8Sb6Tw5A-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/CM_5rQ4DvOG-FNSF51ABSL3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/1I3_cso-RJI-FNSF51ABSL3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/q5DyLe_axQ8-FNSF51ABSL3_-_main_11.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/7jt6MAAjw_6-FNSF51ABSL3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/FGn2OVOnW6v-FNSF51ABSL3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/u_7jVYqsO5V-FNSF51ABSL3_-_main_50.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/nTZP6TM5KUM-FNSF51ABSL3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/TPuTGds-0Q_-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "MTO - Adelaide Essential 3 Seater Fabric Sofa (Steel)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-steel-7534336",
                  ],
                },
              },
              type: "page",
            },
            value: "Steel",
          },
          {
            uid: 7534334,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/bdBwVUMDmo2-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/xi36KlO2-8v-FNSF51ABVP3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/FC26wLHyfdj-FNSF51ABVP3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/Sxp9PgCVqrp-FNSF51ABVP3_-_main_2.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/-tr4TvmWmob-FNSF51ABVP3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/JWoRjLRRyeI-FNSF51ABVP3_-_main_5.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/sfnXTzl_iGW-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Vapour Grey)",
            is_available: true,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
                  ],
                },
              },
              type: "page",
            },
            value: "Vapour Grey",
          },
          {
            uid: 7534323,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-dune-7534323",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/eZjQwT2moSl-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/B_dKBbZIe-FNSF51ABDU3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/Kl5w7kMPi5-FNSF51ABDU3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/hi5FBUNGnY-FNSF51ABDU3_-_main_11.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/ot6HGhulmG-FNSF51ABDU3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/6q9cG0_GtE-FNSF51ABDU3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/7MksauzCyA-FNSF51ABDU3_-_main_50.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/GQVDzaQq_U-FNSF51ABDU3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/usyV26Fvwa-FNSF51ABDU3_-_main_9.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDU30003/MyRznUixIf-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Dune)",
            is_available: false,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-dune-7534323",
                  ],
                },
              },
              type: "page",
            },
            value: "Dune",
          },
          {
            uid: 7534322,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-mocha-7534322",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/4vomM_JIhRS-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/qIDICI011Vf-FNSF51ABMC3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/W3wXZUhcg3a-FNSF51ABMC3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/we5XdmJBcXY-FNSF51ABMC3_-_main_11.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/IO9e_Zu9o2W-FNSF51ABMC3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/UyvzJXPHc6V-FNSF51ABMC3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/BxtiaFlVSEU-FNSF51ABMC3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/prdIY1kX-2e-FNSF51ABMC3_-_main_9.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABMC30003/FK9vTW5xzqu-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Mocha)",
            is_available: false,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-mocha-7534322",
                  ],
                },
              },
              type: "page",
            },
            value: "Mocha",
          },
          {
            uid: 7534333,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-olive-7534333",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABOG30003/8ATciih73qN-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABOG30003/WIDYDQ66Q4c-FNSF51ABOG3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABOG30003/su4kKj2-U2Z-FNSF51ABOG3_-_main_2.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABOG30003/qw8nrUWZq-FNSF51ABOG3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABOG30003/tGhw0NdUi--FNSF51ABOG3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABOG30003/v_z3rT1V-1-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Olive)",
            is_available: false,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-olive-7534333",
                  ],
                },
              },
              type: "page",
            },
            value: "Olive",
          },
          {
            uid: 7534342,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-pebble-grey-7534342",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/_jxIWqMV-3x-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/asKvnWUun-w-FNSF51ABPG3_-_main_1.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/lNV53CHHrEG-FNSF51ABPG3_-_main_10.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/3y1Sm_OTWXW-FNSF51ABPG3_-_main_2.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/Vp1kGG0Mdyn-FNSF51ABPG3_-_main_3.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/shSnGjVNESX-FNSF51ABPG3_-_main_8.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPG30003/h3UfEoHDWcO-Product_Dimensions3s-(1).png",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Pebble Grey)",
            is_available: false,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-pebble-grey-7534342",
                  ],
                },
              },
              type: "page",
            },
            value: "Pebble Grey",
          },
          {
            uid: 7534330,
            _custom_meta: [],
            slug: "adelaide-essential-3-seater-fabric-sofa-smoke-7534330",
            medias: [
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/J9xRKalGPj-1_Base-Image-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/riTGtJlHg-FNSF51ABDA3_-_main_25.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/D2Hg6biN2S-Product_Dimensions3s-(1).png",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/-SNQqxb4TS-a.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/zSFLQehygl-b.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/DfzfyuJUB1-c.jpg",
              },
              {
                type: "image",
                alt: "",
                url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSM30003/qTz37lzx4t-d.jpg",
              },
            ],
            _custom_json: {},
            name: "Adelaide Essential 3 Seater Fabric Sofa (Smoke)",
            is_available: false,
            action: {
              page: {
                type: "product",
                params: {
                  slug: [
                    "adelaide-essential-3-seater-fabric-sofa-smoke-7534330",
                  ],
                },
              },
              type: "page",
            },
            value: "Smoke",
          },
        ],
        group_id: "Adelaide-Essential",
        display_type: "image",
        header: "Colour",
        key: "colour",
      },
    ],
    error: null,
    loading: false,
  },
  product_meta: {
    sizes: [
      {
        display: "REGULAR",
        value: "REGULAR",
        quantity: 0,
        is_available: true,
        seller_identifiers: ["FNSF51ABPL30003"],
        weight: {
          shipping: 47000,
          unit: "gram",
          is_default: true,
        },
        dimension: {
          length: 198.12,
          is_default: true,
          unit: "cm",
          width: 87.63,
          height: 90.932,
        },
      },
    ],
    discount: "30% OFF",
    stores: {
      count: 1,
    },
    sellable: true,
    tags: [],
    no_of_boxes: 1,
    custom_order: {
      manufacturing_time: 9,
      manufacturing_time_unit: "days",
      is_custom_order: true,
    },
    multi_size: true,
    teaser_tag: {},
    size_chart: {},
    price: {
      marked: {
        min: 1000000,
        max: 1000000,
        currency_code: "INR",
        currency_symbol: "₹",
      },
      effective: {
        min: 700000,
        max: 700000,
        currency_code: "INR",
        currency_symbol: "₹",
      },
      selling: {
        min: 700000,
        max: 700000,
        currency_code: "INR",
        currency_symbol: "₹",
      },
    },
    discount_meta: {},
    moq: {},
    product_name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
    error: null,
    loading: false,
  },
  similar_compare_products: {},
  frequently_compared_products: {},
  product_price_by_slug: {
    items: [
      {
        is_serviceable: true,
        store: {
          uid: 148,
          name: "Bidadi FC",
          count: 1,
        },
        article_assignment: {
          strategy: "optimal",
          level: "multi-companies",
        },
        is_cod: true,
        strategy_wise_listing: [
          {
            distance: 32,
            pincode: "562109",
            tat: 3600,
            quantity: 0,
          },
        ],
        quantity: 0,
        item_type: "standard",
        grouped_attributes: [],
        return_config: {
          unit: "days",
          returnable: true,
          time: 7,
        },
        article_id: "148_FNSF51ABPL30003",
        is_gift: false,
        seller_count: 1,
        price_per_piece: {
          effective: 700000,
          currency_code: "INR",
          currency_symbol: "₹",
          marked: 1000000,
          selling: 700000,
        },
        discount_meta: {},
        discount: "30% OFF",
        long_lat: [77.4008049290962, 12.754715400000006],
        price: {
          effective: 700000,
          currency_code: "INR",
          currency_symbol: "₹",
          marked: 1000000,
          selling: 700000,
        },
        price_per_unit: {
          unit: "nos",
          currency_symbol: "₹",
          currency_code: "INR",
          price: 700000,
        },
        pincode: 562109,
        marketplace_attributes: [
          {
            title: "Other Details",
            details: [
              {
                value: "₹10,00,000.00 inclusive of all taxes",
                type: "text",
                key: "MRP",
              },
              {
                value: "198.12 x 87.63 x 90.932 cm",
                type: "text",
                key: "Dimension",
              },
            ],
          },
        ],
        seller: {
          uid: 95,
          name: "Urban Ladder",
          count: 1,
        },
        delivery_promise: {
          min: "2025-10-28T17:01:18Z",
          max: "2025-10-28T17:01:18Z",
        },
        product_name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
        size: "REGULAR",
        slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
      },
    ],
    error: null,
    loading: false,
  },
  product_seller_by_slug: {},
  follow_by_id: {},
  follower_count_by_id: {},
  followed_listing: {},
  fetch_follow_ids: {
    data: {
      products: [],
      brands: [],
      collections: [],
    },
    error: null,
    loading: false,
  },
  unfollow_by_id: {},
  product_lists: {},
  product_listing_meta: {},
  category_listing_meta: {},
  collection_listing_meta: {},
  brand_listing_meta: {},
  search_results: {
    message: "Query should not be empty or special character for autocomplete.",
    error: null,
    loading: false,
  },
  product_search_results: {
    filters: [
      {
        values: [
          {
            display: "UL Furniture",
            value: "ul-furniture",
            count: 3,
            logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/department.png",
            is_selected: false,
          },
        ],
        key: {
          kind: "multivalued",
          name: "departments",
          display: "Department",
          logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/department.png",
        },
      },
      {
        values: [
          {
            display: "Urban Ladder",
            value: "urban-ladder",
            count: 2,
            logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
            is_selected: false,
          },
          {
            display: "Urban Ladder Create",
            value: "urban-ladder-create",
            count: 1,
            logo: "https://cdn.swadeshonline.com/v2/patient-paper-41f385/swad-p/wrkr/brands/pictures/square-logo/original/d_9a0Pbsj-Logo.jpeg",
            is_selected: false,
          },
        ],
        key: {
          kind: "multivalued",
          name: "brand",
          display: "Brands",
          logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/brand.png",
        },
      },
      {
        values: [
          {
            display: "REGULAR",
            value: "REGULAR",
            count: 3,
            logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/sizes.png",
            is_selected: false,
          },
        ],
        key: {
          kind: "multivalued",
          name: "sizes",
          display: "Size",
          logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/sizes.png",
        },
      },
      {
        values: [
          {
            count: 3,
            min: 0,
            max: 800000,
            selected_min: 0,
            selected_max: 800000,
            display: "₹0- ₹800000",
            is_selected: false,
            display_format: "{}- {}₹",
            currency_code: "INR",
            currency_symbol: "₹",
            query_format: "[{},INR TO {},INR]",
          },
        ],
        key: {
          kind: "range",
          name: "min_price_effective",
          display: "Price",
          logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/min-price.png",
        },
      },
      {
        values: [
          {
            display: "Without Storage",
            value: "Without Storage",
            count: 1,
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            is_selected: false,
          },
        ],
        key: {
          kind: "multivalued",
          name: "storage-included",
          display: "Storage Availability",
          logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
        },
      },
      {
        values: [
          {
            display: "In Stock",
            value: "true",
            count: 3,
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            is_selected: false,
          },
        ],
        key: {
          kind: "singlevalued",
          name: "is_available",
          display: "Availability",
          logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
        },
      },
      {
        values: [
          {
            display: "Fabric Sofas",
            value: "fabric-sofas",
            count: 2,
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            is_selected: false,
          },
          {
            display: "Dining Chairs",
            value: "dining-chairs",
            count: 1,
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            is_selected: false,
          },
        ],
        key: {
          kind: "multivalued",
          name: "category",
          display: "Category L3",
          logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
        },
      },
      {
        values: [
          {
            display: "Pre Assembled",
            value: "Pre Assembled",
            count: 2,
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            is_selected: false,
          },
          {
            display: "Requires Assembly",
            value: "Requires Assembly",
            count: 1,
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            is_selected: false,
          },
        ],
        key: {
          kind: "multivalued",
          name: "assembly-required",
          display: "Furniture Assembly",
          logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
        },
      },
    ],
    items: [
      {
        type: "product",
        attributes: {
          _id: "65f928909b13183d131cfef2",
          verification_status: "pending",
          raw: {},
          videos: [],
          store_ids: [148, 149, 150],
          popularity: 981,
          variant_media: {},
          platforms: {},
          multi_categories: [
            {
              l3: 1873,
              l2: 1865,
              is_active: true,
              department: 217,
              l1: 1860,
            },
          ],
          quantity: 8,
          image_nature: "standard",
          expiration_date: "9998-01-30T23:59:00",
          identifier: {
            sku_code: ["FNSTCH15BE30180"],
          },
          max_effective: 800000,
          max_marked: 1500000,
          min_effective: 800000,
          min_marked: 1500000,
          item_id: 7502062,
          store_id_list: ["148", "149", "150"],
          sellable_quantity: 8,
          article_identifiers: ["FNSTCH15BE30180"],
          sizes_with_price: [
            {
              size: "REGULAR",
              identifiers: [
                {
                  gtin_value: "FNSTCH15BE30180",
                  gtin_type: "sku_code",
                },
              ],
              quantity: 8,
            },
          ],
          delivery_zones: [
            "6762b814884a37b2e73d1ea1",
            "6762b815884a37b2e73d1eb9",
            "6762b814884a37b2e73d1ea9",
            "6762b814884a37b2e73d1eb1",
          ],
          factory_type_ids: ["_all_"],
          discount_meta: {},
          identifiers: ["FNSTCH15BE30180"],
          seo: {
            title: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
            description: "",
          },
          "assembly-required": "Requires Assembly",
          "upholstery-material": "Leatherette",
          "primary-material-type": "Solid Wood",
          "primary-material-subtype": "Teak Wood",
          warranty:
            "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
          "quality-promise":
            "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
          returns:
            '<ul> <li>We offer cancellations until the product is Shipped. Returns within 7 days of the delivery are eligible for damaged or defective products. To know more please refer to&nbsp;<a href="https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer">Returns Policy</a></li> <li><strong>Note: </strong>Please do not unbox or assemble the product yourself. Cancellations/ Returns/ Warranty will be void if not unboxed or assembled by Urban Ladder authorized furniture experts.</li> <li>For products purchased with a trial period, eligibility for return within that trial period would be that the product would need to be clean and free from any damages along with the availability of the complete original packaging material.</li> <!-- <li>This product qualifies for a full refund until delivery/installation (as applicable). Post-delivery/installation (as applicable), you will be charged 100% of the&nbsp;product value&nbsp;on cancellation.</li> --> <!-- <li>This product comes with zero cancellation charges, until the time of delivery.</li> <li>Please check the product at the time of delivery. If it is not to your liking or is damaged/defective, you can return it on the spot. Post-delivery, only After Sales services are applicable.</li> <li>On the off-chance that a defect appears in the product after it is delivered, please reach us on hello@urbanladder.com or 080-46666777. We will assess the damage and get back to you with a solution as soon as we can.</li> <li>Please note that the above policies do not apply to all pincodes. To see our return policy for your location, enter your pincode in the box above.</li> <li>You can read our complete terms of sale&nbsp;<span style="color: #0000ff;"><a href="https://www.urbanladder.com/terms-of-offer-for-sale">here</a></span></li> ---></ul>',
          "care-instruction":
            '"<!--<ul> <li>The product comes with a 12 month warranty against any manufacturing defects and any other issues with the materials that have been used.</li> <li>The warranty does not cover damages due to usage of the product beyond its intended use and wear &amp; tear in the natural course of product usage.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li>Termite & Fungus will not be covered under the warranty.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minute difference in fabric color and wood finish between the images here and the actual product. This is caused by the difference in screen calibrations and resolutions across different displays.</strong></li> <li><strong>It is acceptable to have a slight mismatch in dimensions up to 12mm in upholstered products and up to 6mm in non upholstered.</strong></li> <li><strong>Our products are designed for residential use only hence warranty will be void outside residential use</strong></li> </ul>--> <ul> <li>This product comes with a 12 months warranty against manufacturing defects.</li> <li>Fabrics, leatherettes and leathers, if used, will not be covered by the above Warranty. Only our Luxe range of fabrics will be covered under 36 months warranty.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li><a href=""https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer"">Click here</a> to read the complete Warranty policy.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minimal variation in color and finish of the products sold from time to time</strong></li> <li><strong>There can be a minimal variation in dimensions up to 12mm in upholstered products and up to 6mm in non-upholstered products.</strong></li> <li><strong>Our products are designed for the sole purpose of residential usage, hence any usage beyond this will lead to a void of warranty.</strong></li> <li><strong>Termite &amp; Fungus will not be covered under the warranty.</strong></li> <li><strong>Please note that this warranty does not extend to electrical components.</strong></li> </ul>"',
          "ul-premium-space": "6",
          brand_name: "Urban Ladder",
          available_sizes: ["REGULAR"],
          _custom_json: {},
          country_of_origin: "India",
        },
        categories: [
          {
            type: "category",
            uid: 1873,
            name: "Dining Chairs",
            logo: {
              type: "image",
              url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/category/pictures/square-logo/original/GqC8Ap8z3-logo.png",
            },
            action: {
              page: {
                type: "products",
                query: {
                  category: ["dining-chairs"],
                },
              },
              type: "page",
            },
            _custom_json: {},
          },
        ],
        sellable: true,
        name: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
        slug: "dalla-dining-chairs-set-of-2-colour-beige-7502062",
        uid: 7502062,
        item_code: "FNSTCH15BE30180",
        item_type: "standard",
        brand: {
          type: "brand",
          uid: 283,
          name: "Urban Ladder",
          logo: {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
          },
          action: {
            page: {
              type: "products",
              query: {
                brand: ["urban-ladder"],
              },
            },
            type: "page",
          },
          _custom_json: {},
        },
        action: {
          page: {
            type: "product",
            params: {
              slug: ["dalla-dining-chairs-set-of-2-colour-beige-7502062"],
            },
          },
          type: "page",
        },
        medias: [
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/N3ZKDtzk7l-FNSTDC62MB15782_1.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/sZ04Msf3_G-FNSTDC62MB15782_2.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/Y-qPxPaVlO-FNSTDC62MB15782_3.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/YqUZtxU6v-FNSTDC62MB15782_4.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/BKY8j5ad3O-FNSTDC62MB15782_5.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/RS--1rpBja-FNSTDC62MB15782_6.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSTCH15BE30180/6A_F6ac1T8-FNSTDC62MB15782_LP.jpg",
            alt: "Dalla Dining Chairs - Set Of 2 (Colour : Beige)",
          },
        ],
        discount: "47% OFF",
        price: {
          effective: {
            min: 800000,
            max: 800000,
            currency_code: "INR",
            currency_symbol: "₹",
          },
          marked: {
            min: 1500000,
            max: 1500000,
            currency_code: "INR",
            currency_symbol: "₹",
          },
        },
        is_tryout: false,
        channel: "65eb1972926345654bc9c1a8",
        _custom_json: {
          vertex_index_name: "",
          vertex_object_id: 7502062,
        },
        country_of_origin: "India",
        variants: [],
        rating: 0,
        rating_bucket: "0",
        _custom_meta: null,
        sizes: ["REGULAR"],
        tags: [],
        identifiers: ["FNSTCH15BE30180"],
        net_quantity: {},
        teaser_tag: "",
        is_custom_order: false,
      },
      {
        type: "product",
        attributes: {
          _id: "66ea84a56e2a92b264c3440b",
          image_nature: "standard",
          platforms: {},
          variant_media: {},
          multi_categories: [
            {
              l1: 1858,
              is_active: true,
              l2: 1866,
              l3: 1874,
              department: 217,
            },
          ],
          popularity: 962,
          raw: {},
          verification_status: "pending",
          videos: [],
          description: "Fabric",
          store_ids: [148],
          expiration_date: "9998-01-30T23:59:00",
          identifier: {
            sku_code: ["FNSF51ABPL30003"],
          },
          max_effective: 700000,
          max_marked: 1000000,
          min_effective: 700000,
          min_marked: 1000000,
          variants_code: [
            "colour|adelaide-essential-1-seater-fabric-sofa-daschund-brown-7534316,adelaide-essential-1-seater-fabric-sofa-dune-7534319,adelaide-essential-1-seater-fabric-sofa-mocha-7534325,adelaide-essential-1-seater-fabric-sofa-olive-7534341,adelaide-essential-1-seater-fabric-sofa-pearl-7534326,adelaide-essential-1-seater-fabric-sofa-salsa-red-7534343,adelaide-essential-1-seater-fabric-sofa-smoke-7534340,adelaide-essential-1-seater-fabric-sofa-steel-7534331,adelaide-essential-1-seater-fabric-sofa-vapour-grey-7534335,adelaide-essential-2-seater-fabric-sofa-dune-7534332,adelaide-essential-2-seater-fabric-sofa-mocha-7534318,adelaide-essential-2-seater-fabric-sofa-olive-7534321,adelaide-essential-2-seater-fabric-sofa-pearl-7534338,adelaide-essential-2-seater-fabric-sofa-pebble-grey-7534337,adelaide-essential-2-seater-fabric-sofa-salsa-red-7534344,adelaide-essential-2-seater-fabric-sofa-smoke-7534327,adelaide-essential-2-seater-fabric-sofa-steel-7534339,adelaide-essential-2-seater-fabric-sofa-vapour-grey-7534329,adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320,adelaide-essential-3-seater-fabric-sofa-dune-7534323,adelaide-essential-3-seater-fabric-sofa-mocha-7534322,adelaide-essential-3-seater-fabric-sofa-olive-7534333,adelaide-essential-3-seater-fabric-sofa-pebble-grey-7534342,adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328,adelaide-essential-3-seater-fabric-sofa-smoke-7534330,adelaide-essential-3-seater-fabric-sofa-steel-7534336,adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
            "seating-capacity|adelaide-essential-1-seater-fabric-sofa-daschund-brown-7534316,adelaide-essential-1-seater-fabric-sofa-dune-7534319,adelaide-essential-1-seater-fabric-sofa-mocha-7534325,adelaide-essential-1-seater-fabric-sofa-olive-7534341,adelaide-essential-1-seater-fabric-sofa-pearl-7534326,adelaide-essential-1-seater-fabric-sofa-salsa-red-7534343,adelaide-essential-1-seater-fabric-sofa-smoke-7534340,adelaide-essential-1-seater-fabric-sofa-steel-7534331,adelaide-essential-1-seater-fabric-sofa-vapour-grey-7534335,adelaide-essential-2-seater-fabric-sofa-dune-7534332,adelaide-essential-2-seater-fabric-sofa-mocha-7534318,adelaide-essential-2-seater-fabric-sofa-olive-7534321,adelaide-essential-2-seater-fabric-sofa-pearl-7534338,adelaide-essential-2-seater-fabric-sofa-pebble-grey-7534337,adelaide-essential-2-seater-fabric-sofa-salsa-red-7534344,adelaide-essential-2-seater-fabric-sofa-smoke-7534327,adelaide-essential-2-seater-fabric-sofa-steel-7534339,adelaide-essential-2-seater-fabric-sofa-vapour-grey-7534329,adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320,adelaide-essential-3-seater-fabric-sofa-dune-7534323,adelaide-essential-3-seater-fabric-sofa-mocha-7534322,adelaide-essential-3-seater-fabric-sofa-olive-7534333,adelaide-essential-3-seater-fabric-sofa-pebble-grey-7534342,adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328,adelaide-essential-3-seater-fabric-sofa-smoke-7534330,adelaide-essential-3-seater-fabric-sofa-steel-7534336,adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
          ],
          item_id: 7534324,
          store_id_list: ["148"],
          article_identifiers: ["FNSF51ABPL30003"],
          sizes_with_price: [
            {
              size: "REGULAR",
              identifiers: [
                {
                  gtin_type: "sku_code",
                  gtin_value: "FNSF51ABPL30003",
                },
              ],
              quantity: 0,
            },
          ],
          delivery_zones: [
            "6762b814884a37b2e73d1ea9",
            "6762b814884a37b2e73d1ea1",
            "6762b815884a37b2e73d1eb9",
            "6762b814884a37b2e73d1eb1",
          ],
          factory_type_ids: ["_all_"],
          discount_meta: {},
          identifiers: ["FNSF51ABPL30003"],
          seo: {
            title: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
            description: "",
          },
          "assembly-required": "Pre Assembled",
          "seating-capacity": "3 Seater",
          "sofa-material": "Fabric",
          colour: "Pearl",
          "has-free-installation": "No",
          "grouping-attribute": "Yes",
          "show-on-plp": "Yes",
          "ul-premium-space": "27",
          "ul-rank": 73,
          product_details: "Fabric",
          brand_name: "Urban Ladder Create",
          available_sizes: [],
          _custom_json: {},
          country_of_origin: "India",
        },
        categories: [
          {
            type: "category",
            uid: 1874,
            name: "Fabric Sofas",
            logo: {
              type: "image",
              url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/category/pictures/square-logo/original/dUrEKYwg7-logo.png",
            },
            action: {
              page: {
                type: "products",
                query: {
                  category: ["fabric-sofas"],
                },
              },
              type: "page",
            },
            _custom_json: {},
          },
        ],
        sellable: true,
        name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
        slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
        uid: 7534324,
        item_code: "FNSF51ABPL30003",
        item_type: "standard",
        brand: {
          type: "brand",
          uid: 448,
          name: "Urban Ladder Create",
          logo: {
            type: "image",
            url: "https://cdn.swadeshonline.com/v2/patient-paper-41f385/swad-p/wrkr/brands/pictures/square-logo/original/d_9a0Pbsj-Logo.jpeg",
          },
          action: {
            page: {
              type: "products",
              query: {
                brand: ["urban-ladder-create"],
              },
            },
            type: "page",
          },
          _custom_json: {},
        },
        action: {
          page: {
            type: "product",
            params: {
              slug: ["adelaide-essential-3-seater-fabric-sofa-pearl-7534324"],
            },
          },
          type: "page",
        },
        medias: [
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
          {
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
            type: "image",
            alt: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
          },
        ],
        discount: "30% OFF",
        price: {
          effective: {
            min: 700000,
            max: 700000,
            currency_code: "INR",
            currency_symbol: "₹",
          },
          marked: {
            min: 1000000,
            max: 1000000,
            currency_code: "INR",
            currency_symbol: "₹",
          },
        },
        is_tryout: false,
        channel: "65eb1972926345654bc9c1a8",
        _custom_json: {
          vertex_index_name: "",
          vertex_object_id: 7534324,
        },
        country_of_origin: "India",
        variants: [
          {
            logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/popular.png",
            header: "Seating Capacity",
            items: [
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "3 Seater",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534324,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-1-seater-fabric-sofa-pearl-7534326",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-1-seater-fabric-sofa-pearl-7534326",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "1 Seater",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/zz5K5ekL25b-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/w5PMR1vtr7V-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/lx4o2TSy5F9-FNSF51ABPL3_-_main_13.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/Wlr9Z9zt2gn-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/f6CWzmIuBkE-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/r8COhHEWVwf-FNSF51ABPL3_-_main_6.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/GzRJpoe47hV-FNSF51ABPL3_-_main_7.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/0l4KXyZFtjz-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/s4of7v6c5R6-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/7rZymyDg9Yf-Product_Dimensions-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 1 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534326,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-2-seater-fabric-sofa-pearl-7534338",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-2-seater-fabric-sofa-pearl-7534338",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "2 Seater",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/zflwp-fnoCA-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/q878lIaYDqv-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/y4koKNKMup4-FNSF51ABPL3_-_main_12.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/9p0y4NfvPE_-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/nbZKZAnuTpo-FNSF51ABPL3_-_main_4.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/cGQ4mbMcdZJ-FNSF51ABPL3_-_main_5.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/lXBWWg23Zcj-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/07UM_rSVrgZ-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/xNkmyTZQYX_-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/ZvFBmx5dfC2-Product_Dimensions2s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 2 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534338,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Pearl",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534324,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Daschund Brown",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/uwqW-PBGdw-01.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/PNzRkeYB-w-02.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/BAWOsfxtV1-03.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/ipGWJtlu_Y-04.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/CMQRRmvVDL-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/h35K_ds-rI-FNSF51ABDC3_-_main_5.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/yrpdBo39xt-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Daschund Brown)",
                _custom_meta: [],
                uid: 7534320,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Salsa Red",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/w8_gpHEsK0-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/jgpmLIJU4e-FNSF51ABSA3_-_main_1.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/jg5RdqAFLf-FNSF51ABSA3_-_main_2.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/11QUd3k-Ci-FNSF51ABSA3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/nu04Dv0AGc-FNSF51ABSA3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/gnn-QbZFeS-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Salsa Red)",
                _custom_meta: [],
                uid: 7534328,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-steel-7534336",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-steel-7534336",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Steel",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/9he8Sb6Tw5A-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/CM_5rQ4DvOG-FNSF51ABSL3_-_main_1.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/1I3_cso-RJI-FNSF51ABSL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/q5DyLe_axQ8-FNSF51ABSL3_-_main_11.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/7jt6MAAjw_6-FNSF51ABSL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/FGn2OVOnW6v-FNSF51ABSL3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/u_7jVYqsO5V-FNSF51ABSL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/nTZP6TM5KUM-FNSF51ABSL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/TPuTGds-0Q_-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "MTO - Adelaide Essential 3 Seater Fabric Sofa (Steel)",
                _custom_meta: [],
                uid: 7534336,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Vapour Grey",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/bdBwVUMDmo2-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/xi36KlO2-8v-FNSF51ABVP3_-_main_1.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/FC26wLHyfdj-FNSF51ABVP3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/Sxp9PgCVqrp-FNSF51ABVP3_-_main_2.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/-tr4TvmWmob-FNSF51ABVP3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/JWoRjLRRyeI-FNSF51ABVP3_-_main_5.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/sfnXTzl_iGW-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Vapour Grey)",
                _custom_meta: [],
                uid: 7534334,
              },
            ],
            key: "seating-capacity",
            display_type: "text",
            total: 3,
          },
          {
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            header: "Colour",
            items: [
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "3 Seater",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534324,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-1-seater-fabric-sofa-pearl-7534326",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-1-seater-fabric-sofa-pearl-7534326",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "1 Seater",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/zz5K5ekL25b-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/w5PMR1vtr7V-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/lx4o2TSy5F9-FNSF51ABPL3_-_main_13.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/Wlr9Z9zt2gn-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/f6CWzmIuBkE-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/r8COhHEWVwf-FNSF51ABPL3_-_main_6.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/GzRJpoe47hV-FNSF51ABPL3_-_main_7.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/0l4KXyZFtjz-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/s4of7v6c5R6-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30001/7rZymyDg9Yf-Product_Dimensions-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 1 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534326,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-2-seater-fabric-sofa-pearl-7534338",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-2-seater-fabric-sofa-pearl-7534338",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "2 Seater",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/zflwp-fnoCA-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/q878lIaYDqv-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/y4koKNKMup4-FNSF51ABPL3_-_main_12.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/9p0y4NfvPE_-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/nbZKZAnuTpo-FNSF51ABPL3_-_main_4.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/cGQ4mbMcdZJ-FNSF51ABPL3_-_main_5.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/lXBWWg23Zcj-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/07UM_rSVrgZ-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/xNkmyTZQYX_-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30002/ZvFBmx5dfC2-Product_Dimensions2s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 2 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534338,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-pearl-7534324",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Pearl",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/kM51jJPV5C5-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/6QCDyMyMf0B-FNSF51ABPL3_-_main_1.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/NswYBo_RHah-FNSF51ABPL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/ObEgYiio4o5-FNSF51ABPL3_-_main_11.png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/lk0mQytAoJo-FNSF51ABPL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/8Lf5AiFgFGz-FNSF51ABPL3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/WSt2d-dRhlk-FNSF51ABPL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/hp7YLjevy25-FNSF51ABPL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/t5Mrb9hjbTm-FNSF51ABPL3_-_main_9.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABPL30003/87ZzPYPs5bF-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Pearl)",
                _custom_meta: [],
                uid: 7534324,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-daschund-brown-7534320",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Daschund Brown",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/uwqW-PBGdw-01.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/PNzRkeYB-w-02.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/BAWOsfxtV1-03.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/ipGWJtlu_Y-04.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/CMQRRmvVDL-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/h35K_ds-rI-FNSF51ABDC3_-_main_5.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABDC30003/yrpdBo39xt-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Daschund Brown)",
                _custom_meta: [],
                uid: 7534320,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-salsa-red-7534328",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Salsa Red",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/w8_gpHEsK0-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/jgpmLIJU4e-FNSF51ABSA3_-_main_1.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/jg5RdqAFLf-FNSF51ABSA3_-_main_2.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/11QUd3k-Ci-FNSF51ABSA3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/nu04Dv0AGc-FNSF51ABSA3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSA30003/gnn-QbZFeS-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Salsa Red)",
                _custom_meta: [],
                uid: 7534328,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-steel-7534336",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-steel-7534336",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Steel",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/9he8Sb6Tw5A-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/CM_5rQ4DvOG-FNSF51ABSL3_-_main_1.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/1I3_cso-RJI-FNSF51ABSL3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/q5DyLe_axQ8-FNSF51ABSL3_-_main_11.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/7jt6MAAjw_6-FNSF51ABSL3_-_main_25.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/FGn2OVOnW6v-FNSF51ABSL3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/u_7jVYqsO5V-FNSF51ABSL3_-_main_50.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/nTZP6TM5KUM-FNSF51ABSL3_-_main_8.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABSL30003/TPuTGds-0Q_-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "MTO - Adelaide Essential 3 Seater Fabric Sofa (Steel)",
                _custom_meta: [],
                uid: 7534336,
              },
              {
                _custom_json: {},
                slug: "adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
                action: {
                  type: "page",
                  page: {
                    params: {
                      slug: [
                        "adelaide-essential-3-seater-fabric-sofa-vapour-grey-7534334",
                      ],
                    },
                    type: "product",
                  },
                },
                value: "Vapour Grey",
                is_available: true,
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/bdBwVUMDmo2-1_Base-Image-(1).png",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/xi36KlO2-8v-FNSF51ABVP3_-_main_1.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/FC26wLHyfdj-FNSF51ABVP3_-_main_10.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/Sxp9PgCVqrp-FNSF51ABVP3_-_main_2.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/-tr4TvmWmob-FNSF51ABVP3_-_main_3.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/JWoRjLRRyeI-FNSF51ABVP3_-_main_5.jpg",
                    alt: "",
                    type: "image",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51ABVP30003/sfnXTzl_iGW-Product_Dimensions3s-(1).png",
                    alt: "",
                    type: "image",
                  },
                ],
                name: "Adelaide Essential 3 Seater Fabric Sofa (Vapour Grey)",
                _custom_meta: [],
                uid: 7534334,
              },
            ],
            key: "colour",
            display_type: "image",
            total: 10,
          },
        ],
        rating: 0,
        rating_bucket: "0",
        _custom_meta: null,
        sizes: ["REGULAR"],
        tags: [],
        identifiers: ["FNSF51ABPL30003"],
        net_quantity: {},
        teaser_tag: "",
        is_custom_order: false,
      },
      {
        type: "product",
        attributes: {
          _id: "65f9297380e8480b4bb45493",
          videos: [],
          store_ids: [147, 148, 149, 150, 151],
          multi_categories: [
            {
              is_active: true,
              l2: 1866,
              department: 217,
              l1: 1858,
              l3: 1874,
            },
          ],
          verification_status: "pending",
          platforms: {},
          quantity: 10,
          variant_media: {},
          image_nature: "standard",
          popularity: 842,
          raw: {},
          expiration_date: "9998-01-30T23:59:00",
          identifier: {
            sku_code: ["FNSF51HITR300002"],
          },
          max_effective: 57399,
          max_marked: 58399,
          min_effective: 33287,
          min_marked: 58399,
          variants_code: [
            "colour|henrietta-2-seater-fabric-sofa-cloudy-beige-velvet-7502104,henrietta-2-seater-fabric-sofa-davos-plus-7502094,henrietta-2-seater-sofa-icy-turquoise-7502098,henrietta-3-seater-fabric-sofa-cloudy-beige-velvet-7502103,henrietta-3-seater-fabric-sofa-davos-plus-7502095,henrietta-3-seater-fabric-sofa-tuscan-red-7502105,henrietta-3-seater-sofa-icy-turquoise-7502101",
          ],
          item_id: 7502099,
          store_id_list: ["147", "148", "149", "150", "151"],
          sellable_quantity: 10,
          article_identifiers: ["FNSF51HITR300002"],
          sizes_with_price: [
            {
              size: "REGULAR",
              identifiers: [
                {
                  gtin_value: "FNSF51HITR300002",
                  gtin_type: "sku_code",
                },
              ],
              quantity: 10,
            },
          ],
          delivery_zones: [
            "6762b814884a37b2e73d1ea1",
            "6762b815884a37b2e73d1eb9",
            "6762b814884a37b2e73d1ea9",
            "6762b814884a37b2e73d1eb1",
          ],
          factory_type_ids: ["_all_"],
          discount_meta: {},
          identifiers: ["FNSF51HITR300002"],
          seo: {
            title: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
            description: "",
          },
          "assembly-required": "Pre Assembled",
          "seating-capacity": "2 seater",
          "primary-material-type": "Fabric",
          "primary-material-subtype": "Polyester",
          "storage-included": "Without Storage",
          warranty:
            "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
          "quality-promise":
            "<ul> <li>All wood products, go through an intense 3-step treatment for any borers and pests</li> <li>The wood used in the furniture is perfectly seasoned for moisture content</li> <li>Post manufacturing, each product has gone through a stringent quality checking process in 3-stages, with a checkpoint of over 50 quality aspects</li> <li>We go to crazy lengths to ensure our sellers and we hold the badge of quality. We continuously look for feedback to improve the same. So please let us know!</li> </ul> <ul> <li><strong>NOTE : Urban Ladder makes all efforts to ensure that products with wood finishes like Teak, Mahogany etc are colour matched to ensure minimum variations between other products of the same colour. There could be minor variations in colour especially over different batches of products over a period of time.&nbsp; Please consider this while adding products to your existing furniture set.&nbsp;&nbsp;</strong></li> </ul>",
          returns:
            '<ul> <li>We offer cancellations until the product is Shipped. Returns within 7 days of the delivery are eligible for damaged or defective products. To know more please refer to&nbsp;<a href="https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer">Returns Policy</a></li> <li><strong>Note: </strong>Please do not unbox or assemble the product yourself. Cancellations/ Returns/ Warranty will be void if not unboxed or assembled by Urban Ladder authorized furniture experts.</li> <li>For products purchased with a trial period, eligibility for return within that trial period would be that the product would need to be clean and free from any damages along with the availability of the complete original packaging material.</li> <!-- <li>This product qualifies for a full refund until delivery/installation (as applicable). Post-delivery/installation (as applicable), you will be charged 100% of the&nbsp;product value&nbsp;on cancellation.</li> --> <!-- <li>This product comes with zero cancellation charges, until the time of delivery.</li> <li>Please check the product at the time of delivery. If it is not to your liking or is damaged/defective, you can return it on the spot. Post-delivery, only After Sales services are applicable.</li> <li>On the off-chance that a defect appears in the product after it is delivered, please reach us on hello@urbanladder.com or 080-46666777. We will assess the damage and get back to you with a solution as soon as we can.</li> <li>Please note that the above policies do not apply to all pincodes. To see our return policy for your location, enter your pincode in the box above.</li> <li>You can read our complete terms of sale&nbsp;<span style="color: #0000ff;"><a href="https://www.urbanladder.com/terms-of-offer-for-sale">here</a></span></li> ---></ul>',
          "care-instruction":
            '"<!--<ul> <li>The product comes with a 12 month warranty against any manufacturing defects and any other issues with the materials that have been used.</li> <li>The warranty does not cover damages due to usage of the product beyond its intended use and wear &amp; tear in the natural course of product usage.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li>Termite & Fungus will not be covered under the warranty.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minute difference in fabric color and wood finish between the images here and the actual product. This is caused by the difference in screen calibrations and resolutions across different displays.</strong></li> <li><strong>It is acceptable to have a slight mismatch in dimensions up to 12mm in upholstered products and up to 6mm in non upholstered.</strong></li> <li><strong>Our products are designed for residential use only hence warranty will be void outside residential use</strong></li> </ul>--> <ul> <li>This product comes with a 12 months warranty against manufacturing defects.</li> <li>Fabrics, leatherettes and leathers, if used, will not be covered by the above Warranty. Only our Luxe range of fabrics will be covered under 36 months warranty.</li> <li>Please note that the above policies do not apply to all pincodes. To see the policy for your location, enter your pincode in the box above.</li> <li><a href=""https://www.urbanladder.com/terms-of-offer-for-sale?src=g_footer"">Click here</a> to read the complete Warranty policy.</li> <li><strong><span style=""text-decoration: underline;"">NOTE:</span></strong></li> <li><strong>There can be a minimal variation in color and finish of the products sold from time to time</strong></li> <li><strong>There can be a minimal variation in dimensions up to 12mm in upholstered products and up to 6mm in non-upholstered products.</strong></li> <li><strong>Our products are designed for the sole purpose of residential usage, hence any usage beyond this will lead to a void of warranty.</strong></li> <li><strong>Termite &amp; Fungus will not be covered under the warranty.</strong></li> <li><strong>Please note that this warranty does not extend to electrical components.</strong></li> </ul>"',
          "sofa-material": "Fabric",
          colour: "Maroon",
          "has-free-installation": "No",
          "grouping-attribute": "Yes",
          "show-on-plp": "Yes",
          "ul-premium-space": "11",
          "ul-rank": 57,
          brand_name: "Urban Ladder",
          available_sizes: ["REGULAR"],
          _custom_json: {},
          country_of_origin: "India",
        },
        categories: [
          {
            type: "category",
            uid: 1874,
            name: "Fabric Sofas",
            logo: {
              type: "image",
              url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/category/pictures/square-logo/original/dUrEKYwg7-logo.png",
            },
            action: {
              page: {
                type: "products",
                query: {
                  category: ["fabric-sofas"],
                },
              },
              type: "page",
            },
            _custom_json: {},
          },
        ],
        sellable: true,
        name: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
        slug: "henrietta-2-seater-fabric-sofa-tuscan-red-7502099",
        uid: 7502099,
        item_code: "FNSF51HITR300002",
        item_type: "standard",
        brand: {
          type: "brand",
          uid: 283,
          name: "Urban Ladder",
          logo: {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/brands/pictures/square-logo/original/FvwWdBA_w-rattle-AGur24Nxm.png",
          },
          action: {
            page: {
              type: "products",
              query: {
                brand: ["urban-ladder"],
              },
            },
            type: "page",
          },
          _custom_json: {},
        },
        action: {
          page: {
            type: "product",
            params: {
              slug: ["henrietta-2-seater-fabric-sofa-tuscan-red-7502099"],
            },
          },
          type: "page",
        },
        medias: [
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/0vu03S_rY2-FNSF51HITR3_-_LP.png",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/i6JIoB6nYU-FNSF51HITR3_-_main_1.jpg",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/JeoPBeGttJ-FNSF51HITR3_-_main_2.jpg",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/H1Jggj2Jq5-FNSF51HITR3_-_main_3.jpg",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/icifo2rF3p-FNSF51HITR3_-_main_4.jpg",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/5h3DjGY2pY-FNSF51HITR3_-_main_5.jpg",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
          {
            type: "image",
            url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/L36x9QTB2S-FNSF51HITR3_0002_dimensions_1.png",
            alt: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
          },
        ],
        discount: "43% OFF",
        price: {
          effective: {
            min: 33287,
            max: 33287,
            currency_code: "INR",
            currency_symbol: "₹",
          },
          marked: {
            min: 58399,
            max: 58399,
            currency_code: "INR",
            currency_symbol: "₹",
          },
        },
        is_tryout: false,
        channel: "65eb1972926345654bc9c1a8",
        _custom_json: {
          vertex_index_name: "",
          vertex_object_id: 7502099,
        },
        country_of_origin: "India",
        variants: [
          {
            header: "Colour",
            logo: "https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/original/products/pictures/attribute/logo/original/iG82Qjay9X-Popularity.png",
            items: [
              {
                uid: 7502099,
                _custom_meta: [],
                slug: "henrietta-2-seater-fabric-sofa-tuscan-red-7502099",
                is_available: true,
                value: "Maroon",
                name: "Henrietta 2 Seater Fabric Sofa (Tuscan Red)",
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/0vu03S_rY2-FNSF51HITR3_-_LP.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/i6JIoB6nYU-FNSF51HITR3_-_main_1.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/JeoPBeGttJ-FNSF51HITR3_-_main_2.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/H1Jggj2Jq5-FNSF51HITR3_-_main_3.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/icifo2rF3p-FNSF51HITR3_-_main_4.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/5h3DjGY2pY-FNSF51HITR3_-_main_5.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HITR300002/L36x9QTB2S-FNSF51HITR3_0002_dimensions_1.png",
                    type: "image",
                    alt: "",
                  },
                ],
                _custom_json: {},
                action: {
                  page: {
                    type: "product",
                    params: {
                      slug: [
                        "henrietta-2-seater-fabric-sofa-tuscan-red-7502099",
                      ],
                    },
                  },
                  type: "page",
                },
              },
              {
                uid: 7502103,
                _custom_meta: [],
                slug: "henrietta-3-seater-fabric-sofa-cloudy-beige-velvet-7502103",
                is_available: true,
                value: "Beige",
                name: "Henrietta 3 Seater Fabric Sofa (Cloudy Beige Velvet)",
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300003/EYJ6TYXDq5-FNSF51HIBB3_-_LP.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300003/94drReEJsi-FNSF51HIBB3_-_main_1.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300003/bQTaH9vCeJ-FNSF51HIBB3_-_main_2.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300003/l2_Z-bNdAS-FNSF51HIBB3_-_main_3.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300003/_zHxijlQ8d-FNSF51HIBB3_-_main_4.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300003/qf-LNtG2_b-FNSF51HIBB3_0003_dimensions_1.png",
                    type: "image",
                    alt: "",
                  },
                ],
                _custom_json: {},
                action: {
                  page: {
                    type: "product",
                    params: {
                      slug: [
                        "henrietta-3-seater-fabric-sofa-cloudy-beige-velvet-7502103",
                      ],
                    },
                  },
                  type: "page",
                },
              },
              {
                uid: 7502104,
                _custom_meta: [],
                slug: "henrietta-2-seater-fabric-sofa-cloudy-beige-velvet-7502104",
                is_available: true,
                value: "Beige",
                name: "Henrietta 2 Seater Fabric Sofa (Cloudy Beige Velvet)",
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300002/82P_As8zg-FNSF51HIBB3_-_LP.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300002/CUZr38WUPE-FNSF51HIBB3_-_main_1.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300002/p-gRRsYWme-FNSF51HIBB3_-_main_2.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300002/Oh95qZVY1m-FNSF51HIBB3_-_main_3.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300002/NwQwYU9W1u-FNSF51HIBB3_-_main_4.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIBB300002/Mo0XYjr9LT-FNSF51HIBB3_0002_dimensions_1.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/videos/item/free/original/2JIQEmWha-Henrietta-2-Seater-Fabric-Sofa-(Cloudy-Beige-Velvet).mp4",
                    type: "video",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/3d-model/item/free/original/oZKGYTkmM-chair3.glb",
                    type: "3d_model",
                    alt: "",
                  },
                ],
                _custom_json: {},
                action: {
                  page: {
                    type: "product",
                    params: {
                      slug: [
                        "henrietta-2-seater-fabric-sofa-cloudy-beige-velvet-7502104",
                      ],
                    },
                  },
                  type: "page",
                },
              },
              {
                uid: 7502094,
                _custom_meta: [],
                slug: "henrietta-2-seater-fabric-sofa-davos-plus-7502094",
                is_available: true,
                value: "Blue",
                name: "Henrietta 2 Seater Fabric Sofa (Davos Plus)",
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/AQAK9XvEJa-FNSF51HIDP3_-_LP.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/mKn2w5xA3E-FNSF51HIDP3_-_main_1.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/N5sxUE5n-7-FNSF51HIDP3_-_main_2.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/-vQoIdYZce-FNSF51HIDP3_-_main_3.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/cK4WIBA60Ym-FNSF51HIDP3_-_main_4.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/F3RmJelE9HQ-FNSF51HIDP3_-_main_5.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300002/eaWBqmx9oQY-FNSF51HIDP3_0002_dimensions_1.png",
                    type: "image",
                    alt: "",
                  },
                ],
                _custom_json: {},
                action: {
                  page: {
                    type: "product",
                    params: {
                      slug: [
                        "henrietta-2-seater-fabric-sofa-davos-plus-7502094",
                      ],
                    },
                  },
                  type: "page",
                },
              },
              {
                uid: 7502095,
                _custom_meta: [],
                slug: "henrietta-3-seater-fabric-sofa-davos-plus-7502095",
                is_available: true,
                value: "Blue",
                name: "Henrietta 3 Seater Fabric Sofa (Davos Plus)",
                medias: [
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/r_RaDARFzx7-FNSF51HIDP3_-_LP.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/nkXkjAbbj88-FNSF51HIDP3_-_main_1.png",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/Gn7YHPnQMlK-FNSF51HIDP3_-_main_2.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/yyetPa3zNHY-FNSF51HIDP3_-_main_3.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/lyZ9kp1CNkL-FNSF51HIDP3_-_main_4.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/brFUqyXhogn-FNSF51HIDP3_-_main_5.jpg",
                    type: "image",
                    alt: "",
                  },
                  {
                    url: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/products/pictures/item/free/original/FNSF51HIDP300003/bM7IjpSdC-FNSF51HIDP3_0003_dimensions_1.png",
                    type: "image",
                    alt: "",
                  },
                ],
                _custom_json: {},
                action: {
                  page: {
                    type: "product",
                    params: {
                      slug: [
                        "henrietta-3-seater-fabric-sofa-davos-plus-7502095",
                      ],
                    },
                  },
                  type: "page",
                },
              },
            ],
            key: "colour",
            display_type: "image",
            total: 8,
          },
        ],
        rating: 0,
        rating_bucket: "0",
        _custom_meta: null,
        sizes: ["REGULAR"],
        tags: [],
        identifiers: ["FNSF51HITR300002"],
        net_quantity: {},
        teaser_tag: "",
        is_custom_order: false,
      },
    ],
    page: {
      has_previous: false,
      has_next: false,
      item_total: 3,
      type: "cursor",
      next_id: "0",
    },
    sort_on: [
      {
        value: "popular",
        logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/popular.png",
        display: "Popularity",
        priority: 1,
        is_selected: true,
        name: "Popularity",
      },
      {
        value: "price_asc",
        logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/price-asc.png",
        display: "Price Low to High",
        priority: 2,
        name: "Price Low to High",
        is_selected: false,
      },
      {
        value: "price_dsc",
        logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/price-dsc.png",
        display: "Price High to Low",
        priority: 3,
        name: "Price High to Low",
        is_selected: false,
      },
      {
        value: "discount_dsc",
        logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/discount-dsc.png",
        display: "Discount High to Low",
        priority: 4,
        name: "Discount High to Low",
        is_selected: false,
      },
      {
        value: "discount_asc",
        logo: "https://cdn.pixelbin.io/v2/patient-paper-41f385/8ScdyV/wrkr/swadeshz5/misc/default-assets/original/discount-asc.png",
        display: "Discount Low to High",
        priority: 5,
        name: "Discount Low to High",
        is_selected: false,
      },
    ],
    meta: {
      provider: {
        name: "vertex",
        version: "0.0.1",
      },
      attributionToken:
        "jAHwiwoMCN7JxMcGEMGfmrUCEAEaJDY5MTQ0ZGNiLTAwMDAtMmRmZi1hMTE1LWQ0ZjU0N2U1ZjU0YyoYNjhjYTc4M2Q4MmZjYTMxZGU4ZDNlN2M3MiSOkckwnNa3LY6-nRXUsp0VwvCeFajlqi2f1rctt7eMLZD3sjA6DmRlZmF1bHRfc2VhcmNoaAF6AnNp",
    },
    error: null,
    loading: false,
  },
  location_details: {},
  stores_details: {},
  instock_locations: {},
};

const sortedId = {
  1: "69033615dabc96c1af620c3e",
  2: "690335b9dabc96c1af620c38",
  3: "690327c80ad41f867e32da81",
  4: "69031d93e549d142aceb1f31",
  5: "69031d8fe549d142aceb1f2b",
  6: "69031d8ae549d142aceb1f24",
  7: "69031d86e549d142aceb1f1e",
  8: "69031d84e549d142aceb1f18",
  9: "69031d82e549d142aceb1f13",
  10: "69031d7ee549d142aceb1f0c",
  11: "69031d7ae549d142aceb1f06",
  12: "69031d78e549d142aceb1f00",
  13: "69031d75e549d142aceb1ef9",
  14: "69031d73e549d142aceb1ef3",
  15: "69031d71e549d142aceb1eee",
  16: "69031d6ee549d142aceb1ee9",
  17: "69031d6ce549d142aceb1ee4",
  18: "69031cd6e549d142aceb1edc",
  19: "69031cd4e549d142aceb1ed7",
  20: "69031cd2e549d142aceb1ed2",
  21: "69031cbce549d142aceb1ecb",
  22: "69031cb9e549d142aceb1ec4",
  23: "69031cb5e549d142aceb1ebe",
  24: "69031cb3e549d142aceb1eb9",
  25: "69031cb0e549d142aceb1eb4",
  26: "69031c8ae549d142aceb1ea9",
  27: "69031c87e549d142aceb1ea3",
  28: "69031c85e549d142aceb1e9d",
  29: "69031c83e549d142aceb1e97",
  30: "69031c81e549d142aceb1e91",
  31: "69031c7ee549d142aceb1e8b",
  32: "69031c7ce549d142aceb1e85",
  33: "69031c7ae549d142aceb1e7f",
  34: "69031c78e549d142aceb1e79",
  35: "69031c77e549d142aceb1e73",
  36: "69031c75e549d142aceb1e6d",
  37: "69031c72e549d142aceb1e67",
  38: "69031c70e549d142aceb1e61",
  39: "69031c6ee549d142aceb1e5c",
  40: "69031c6ce549d142aceb1e57",
  41: "69031c6ae549d142aceb1e52",
  42: "69031c5fe549d142aceb1e4c",
  43: "69031c3ae549d142aceb1e44",
  44: "69031c30e549d142aceb1e3c",
  45: "69031c1ee549d142aceb1e34",
  46: "69031beae549d142aceb1e2c",
  47: "69031bdde549d142aceb1e26",
  48: "69031bcee549d142aceb1e1e",
  49: "69031bbae549d142aceb1e16",
  50: "69031b9ae549d142aceb1e0c",
};

//page = 0, limit = 20
const result1 = {
  1: "69033615dabc96c1af620c3e",
  2: "690335b9dabc96c1af620c38",
  3: "690327c80ad41f867e32da81",
  4: "69031d93e549d142aceb1f31",
  5: "69031d8fe549d142aceb1f2b",
  6: "69031d8ae549d142aceb1f24",
  7: "69031d86e549d142aceb1f1e",
  8: "69031d84e549d142aceb1f18",
  9: "69031d82e549d142aceb1f13",
  10: "69031d7ee549d142aceb1f0c",
  11: "69031d7ae549d142aceb1f06",
  12: "69031d78e549d142aceb1f00",
  13: "69031d75e549d142aceb1ef9",
  14: "69031d73e549d142aceb1ef3",
  15: "69031d71e549d142aceb1eee",
  16: "69031d6ee549d142aceb1ee9",
  17: "69031d6ce549d142aceb1ee4",
  18: "69031cd6e549d142aceb1edc",
  19: "69031cd4e549d142aceb1ed7",
  20: "69031cd2e549d142aceb1ed2",
};

//page = 1, limit = 20
const result2 = {
  1: "69031cbce549d142aceb1ecb",
  2: "69031cb9e549d142aceb1ec4",
  3: "69031cb5e549d142aceb1ebe",
  4: "69031cb3e549d142aceb1eb9",
  5: "69031cb0e549d142aceb1eb4",
  6: "69031c8ae549d142aceb1ea9",
  7: "69031c87e549d142aceb1ea3",
  8: "69031c85e549d142aceb1e9d",
  9: "69031c83e549d142aceb1e97",
  10: "69031c81e549d142aceb1e91",
  11: "69031c7ee549d142aceb1e8b",
  12: "69031c7ce549d142aceb1e85",
  13: "69031c7ae549d142aceb1e7f",
  14: "69031c78e549d142aceb1e79",
  15: "69031c77e549d142aceb1e73",
  16: "69031c75e549d142aceb1e6d",
  17: "69031c72e549d142aceb1e67",
  18: "69031c70e549d142aceb1e61",
  19: "69031c6ee549d142aceb1e5c",
  20: "69031c6ce549d142aceb1e57",
};
