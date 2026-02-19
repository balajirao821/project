const fs = require("fs");
const pdfParse = require("pdf-parse");

module.exports = async function parsePDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pages = [];

  await pdfParse(buffer, {
    pagerender: pageData => {
      const pageNumber = pageData.pageIndex + 1;

      return pageData.getTextContent().then(textContent => {
        const pageText = textContent.items
          .map(item => item.str)
          .join(" ");

        pages.push({
          text: pageText,
          page: pageNumber
        });
        return pageText;
      });
    }
  });

  return pages;
};
