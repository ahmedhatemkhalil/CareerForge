import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse-fork'; 
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor'; 

const extractor = new WordExtractor();

export const extractTextFromFile = async (filePath, originalName = '') => {
    try {
        const extFromPath = path.extname(filePath).toLowerCase();
        const extFromName = originalName ? path.extname(originalName).toLowerCase() : '';
        const fileExtension = extFromPath || extFromName;

        const dataBuffer = fs.readFileSync(filePath);
        let extractedText = '';

        if (fileExtension === '.pdf') {
            const pdfData = await pdf(dataBuffer);
            extractedText = pdfData.text;
        } 
        else if (fileExtension === '.docx') {
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            extractedText = result.value;
        } 
        else if (fileExtension === '.doc') {
            const extracted = await extractor.extract(filePath);
            extractedText = extracted.getBody();
        } 
        else {
            throw new Error(`Unsupported file format (${fileExtension}). Use PDF, DOCX or DOC.`);
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error("The file seems to be empty or unreadable.");
        }

        return extractedText.trim();
    } catch (error) {
        console.error("❌ File Parser Error Details:", error.message);
        throw new Error(error.message);
    }
};