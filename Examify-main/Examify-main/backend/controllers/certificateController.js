const PDFDocument = require('pdfkit');
const Result = require('../models/Result');
exports.generateCertificate = async (req, res) => {
    const { resultId } = req.params;
    try {
        const result = await Result.findById(resultId)
            .populate('exam')
            .populate('user')
            .populate({
                path: 'exam',
                populate: {
                    path: 'createdBy',  
                    select: 'username name'  
                }
            });
            
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        if (!result.user || !result.user.username) {
            return res.status(400).json({ message: 'User information is missing in the result.' });
        }
        
        const username = result.user.username;
        const name = username.split('@')[0];
        
        let examinerName = "Examiner";
        if (result.exam && result.exam.createdBy) {
            
            examinerName = result.exam.createdBy.name || 
                          (result.exam.createdBy.username ? 
                           result.exam.createdBy.username.split('@')[0] : 
                           "Examiner");
        }
        
        
        const doc = new PDFDocument({
            size: 'A4',
            margin: 0
        });
        
        const filename = `certificate-${resultId}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);
        
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
           .lineWidth(3)
           .stroke('#0057B8');
           
      
        doc.fontSize(25)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('Certificate of Achievement', {
               align: 'center',
               width: doc.page.width
           }, 140);
        
        doc.moveDown(1.5);
        
        
        doc.fontSize(16)
           .font('Helvetica')
           .text(`This certifies that ${name}`, {
               align: 'center'
           });
        
        doc.moveDown();
        
        
        doc.fontSize(16)
           .text(`has successfully completed the exam: ${result.exam.title}`, {
               align: 'center'
           });
        
        doc.moveDown();
        
        doc.text(`Score: ${result.score}`, {
            align: 'center'
        });
        doc.text(`Status: ${result.passed ? 'Passed' : 'Failed'}`, {
            align: 'center'
        });
        
 
        doc.moveDown(3);
        

        const centerX = doc.page.width / 2;
        const signatureWidth = 150;
        doc.moveTo(centerX - signatureWidth/2, doc.y)
           .lineTo(centerX + signatureWidth/2, doc.y)
           .stroke();
        
        doc.moveDown(0.5);
        
     
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(examinerName, {
               align: 'center'
           });
        
        doc.moveDown(0.3);
        
        
        doc.fontSize(14)
           .font('Helvetica')
           .text('Examiner', {
               align: 'center'
           });
        
     
        doc.fontSize(14)
           .text(`${new Date().toLocaleDateString()}`, {
               align: 'center'
           }, 500);
        
        doc.fontSize(12)
           .text('Completion Date', {
               align: 'center'
           });
        
        doc.end();
    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ message: 'Server error' });
    }
};