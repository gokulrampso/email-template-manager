/**
 * Generate HTML email from blocks and settings
 */
export function generateHtml(blocks, settings) {
  const { backgroundColor, contentWidth, fontFamily } = settings;

  const blocksHtml = blocks.map((block) => generateBlockHtml(block)).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    td { padding: 0; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: ${fontFamily}; background-color: ${backgroundColor};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="${contentWidth}" cellpadding="0" cellspacing="0" role="presentation" style="max-width: ${contentWidth}px; width: 100%;">
${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateBlockHtml(block) {
  const { type, content } = block;

  switch (type) {
    case 'header':
      return generateHeaderHtml(content);
    case 'text':
      return generateTextHtml(content);
    case 'button':
      return generateButtonHtml(content);
    case 'image':
      return generateImageHtml(content);
    case 'divider':
      return generateDividerHtml(content);
    case 'spacer':
      return generateSpacerHtml(content);
    case 'social':
      return generateSocialHtml(content);
    case 'footer':
      return generateFooterHtml(content);
    default:
      return '';
  }
}

function generateHeaderHtml(content) {
  const fontSize = content.level === 'h1' ? '28px' : content.level === 'h2' ? '24px' : '20px';
  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px; text-align: ${content.align};">
              <${content.level} style="margin: 0; font-size: ${fontSize}; font-weight: bold; color: ${content.color};">
                ${escapeHtml(content.text)}
              </${content.level}>
            </td>
          </tr>`;
}

function generateTextHtml(content) {
  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px; text-align: ${content.align};">
              <p style="margin: 0; font-size: ${content.fontSize}px; line-height: ${content.lineHeight}; color: ${content.color};">
                ${escapeHtml(content.text).replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>`;
}

function generateButtonHtml(content) {
  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px; text-align: ${content.align};">
              <a href="${content.url}" style="display: inline-block; padding: 12px 30px; background-color: ${content.buttonColor}; color: ${content.textColor}; text-decoration: none; border-radius: ${content.borderRadius}px; font-weight: bold;">
                ${escapeHtml(content.text)}
              </a>
            </td>
          </tr>`;
}

function generateImageHtml(content) {
  const imgTag = `<img src="${content.src}" alt="${escapeHtml(content.alt)}" style="display: block; width: ${content.width}; max-width: 100%; margin: 0 auto;" />`;
  const wrappedImg = content.link 
    ? `<a href="${content.link}" style="display: inline-block;">${imgTag}</a>` 
    : imgTag;

  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px; text-align: ${content.align};">
              ${wrappedImg}
            </td>
          </tr>`;
}

function generateDividerHtml(content) {
  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px;">
              <hr style="border: none; border-top: ${content.thickness}px ${content.style} ${content.color}; width: ${content.width}; margin: 0 auto;" />
            </td>
          </tr>`;
}

function generateSpacerHtml(content) {
  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; height: ${content.height}px; font-size: 0; line-height: 0;">
              &nbsp;
            </td>
          </tr>`;
}

function generateSocialHtml(content) {
  const icons = [];
  
  if (content.facebook) {
    icons.push(`<a href="${content.facebook}" style="display: inline-block; margin: 0 6px;">
      <img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" width="${content.iconSize}" height="${content.iconSize}" style="border: 0;" />
    </a>`);
  }
  if (content.twitter) {
    icons.push(`<a href="${content.twitter}" style="display: inline-block; margin: 0 6px;">
      <img src="https://cdn-icons-png.flaticon.com/32/733/733579.png" alt="Twitter" width="${content.iconSize}" height="${content.iconSize}" style="border: 0;" />
    </a>`);
  }
  if (content.instagram) {
    icons.push(`<a href="${content.instagram}" style="display: inline-block; margin: 0 6px;">
      <img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" width="${content.iconSize}" height="${content.iconSize}" style="border: 0;" />
    </a>`);
  }
  if (content.linkedin) {
    icons.push(`<a href="${content.linkedin}" style="display: inline-block; margin: 0 6px;">
      <img src="https://cdn-icons-png.flaticon.com/32/733/733561.png" alt="LinkedIn" width="${content.iconSize}" height="${content.iconSize}" style="border: 0;" />
    </a>`);
  }

  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px; text-align: ${content.align};">
              ${icons.join('\n              ')}
            </td>
          </tr>`;
}

function generateFooterHtml(content) {
  return `          <tr>
            <td style="background-color: ${content.backgroundColor}; padding: ${content.padding}px; text-align: ${content.align};">
              <p style="margin: 0 0 8px; font-size: ${content.fontSize}px; color: ${content.color};">
                ${escapeHtml(content.text)}
              </p>
              ${content.address ? `<p style="margin: 0 0 8px; font-size: ${content.fontSize}px; color: ${content.color};">
                ${escapeHtml(content.address)}
              </p>` : ''}
              ${content.unsubscribeText ? `<p style="margin: 0; font-size: ${content.fontSize}px;">
                <a href="${content.unsubscribeUrl}" style="color: ${content.color}; text-decoration: underline;">
                  ${escapeHtml(content.unsubscribeText)}
                </a>
              </p>` : ''}
            </td>
          </tr>`;
}

function escapeHtml(text) {
  if (!text) return '';
  
  // First, extract and preserve placeholders like {{variable}}
  const placeholders = [];
  let processedText = text.replace(/\{\{([^}]+)\}\}/g, (match) => {
    placeholders.push(match);
    return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });
  
  // Escape HTML in the remaining text
  processedText = processedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Restore placeholders
  placeholders.forEach((placeholder, index) => {
    processedText = processedText.replace(`__PLACEHOLDER_${index}__`, placeholder);
  });
  
  return processedText;
}

