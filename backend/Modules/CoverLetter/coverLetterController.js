// controllers/coverLetterController.js
import CoverLetter from '../../models/CoverLetter.js';
import { Analysis } from '../../models/Analysis.js';

const getTemplates = (type, companyName, jobTitle, hrName, strengthsBulletPoints, strengthsInline) => {
  let coverLetterText = '';
  let emailText = '';

  switch (type) {
    case 'creative': 
      coverLetterText = `Hi ${hrName || 'Hiring Team'} @ ${companyName},

I’ve been following ${companyName}'s journey, and I’m incredibly excited about the open ${jobTitle} position. I thrive in dynamic environments where clean code meets modern user experiences, and I believe my technical background is a perfect match for your culture.

When looking at my core engineering capabilities, a few key strengths stand out:
${strengthsBulletPoints}

I don't just write code; I love architecting solutions that solve real problems. I’m eager to bring my drive for innovation to your engineering team. Thank you for reading, and I’d love to sync up for a chat soon!

Best regards,
[Your Name]`;

      emailText = `Subject: Quick Question regarding ${jobTitle} role - [Your Name]

Hi ${hrName || 'Hiring Team'},

I hope this email finds you well! I just applied for the ${jobTitle} role at ${companyName} and wanted to reach out personally.

My practical experience focuses heavily on ${strengthsInline.toLowerCase()}, and I’m super excited about the impact I could make with your product team.

Attached is my resume. Thanks for your time!

Cheers,
[Your Name]`;
      break;

    case 'technical': 
      coverLetterText = `Dear ${hrName || 'Hiring Team'},

Please accept this letter as a formal application for the ${jobTitle} station at ${companyName}. I am a software engineer focused on structural data optimization, robust API construction, and high-performance system design.

An analytical review of my development capabilities highlights the following computational and full-stack strengths:
${strengthsBulletPoints}

My workflow is strictly aligned with modern architectural paradigms, clean-code methodologies, and scalable database systems. I look forward to deploying these validated technical skills within ${companyName}'s engineering pipeline. Thank you for your evaluation.

Sincerely,
[Your Name]`;

      emailText = `Subject: Technical Profile: Application for ${jobTitle} - [Your Name]

Dear ${hrName || 'Hiring Team'},

I am writing to formally submit my technical profile for the ${jobTitle} position at ${companyName}.

My core stack uniquely validates competencies in ${strengthsInline.toLowerCase()}, establishing a reliable foundation for immediate contribution to your development sprints.

Thank you for reviewing the attached documentation.

Regards,
[Your Name]`;
      break;

    case 'formal':
    default: 
      coverLetterText = `Dear ${hrName || 'Hiring Team'},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. As an ambitious software engineer with a comprehensive educational background and hands-on laboratory training, I am highly motivated to contribute to your engineering goals.

Following a rigorous computational analysis of my technical profile, my core professional capabilities are uniquely aligned with your requirements, specifically highlighted by:

${strengthsBulletPoints}

Throughout my intensive academic and project execution workflows, I have consistently focused on building responsive user interfaces and structuring robust back-end APIs. 

Joining ${companyName} represents a milestone where I can apply these validated competencies. Thank you for your time, review, and consideration.

Best regards,
[Your Name]`;

      emailText = `Subject: Application for ${jobTitle} - [Your Name]

Dear ${hrName || 'Hiring Team'},

Please accept this email and the attached resume as my formal application for the ${jobTitle} position currently open at ${companyName}.

An expert assessment of my technical stack demonstrates deep competencies in key areas, including ${strengthsInline.toLowerCase()}. 

Thank you for your valuable time and consideration.

Sincerely,
[Your Name]`;
      break;
  }

  return { coverLetterText, emailText };
};

// ==========================================
// 1. CREATE: إنشاء وحفظ
// ==========================================
export const generateAndSave = async (req, res, next) => {
  try {
    const { analysisId, companyName, jobTitle, hrName, templateType, userId: bodyUserId } = req.body;
    const userId = req.user?.id || req.user?._id || bodyUserId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID could not be resolved.' });
    }

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis data not found' });
    }

    const allStrengths = analysis.strengths && analysis.strengths.length > 0 
      ? analysis.strengths 
      : ["Proficiency in advanced full-stack software development technologies."];

    const strengthsBulletPoints = allStrengths.map(str => `• ${str}`).join('\n');
    const strengthsInline = allStrengths.slice(0, 3).join(', and ');

    const chosenType = templateType || 'formal';
    const { coverLetterText, emailText } = getTemplates(chosenType, companyName, jobTitle, hrName, strengthsBulletPoints, strengthsInline);

    const newCoverLetter = new CoverLetter({
      userId,
      analysisId,
      companyName,
      jobTitle,
      hrName: hrName || 'Hiring Team',
      templateType: chosenType,
      generatedCoverLetter: coverLetterText,
      generatedEmail: emailText
    });

    await newCoverLetter.save();

    res.status(201).json({
      success: true,
      message: `${chosenType.toUpperCase()} Cover Letter and Email generated successfully!`,
      data: newCoverLetter
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. READ (ALL)
// ==========================================
export const getUserCoverLetters = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID missing.' });

    const history = await CoverLetter.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 3. READ (SINGLE)
// ==========================================
export const getSingleCoverLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const coverLetter = await CoverLetter.findById(id);
    if (!coverLetter) return res.status(404).json({ success: false, message: 'Document not found' });

    if (coverLetter.userId?.toString() !== userId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: coverLetter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 4. UPDATE
// ==========================================
export const updateCoverLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { companyName, jobTitle, hrName, templateType } = req.body;
    const userId = req.user?.id || req.user?._id;

    let coverLetter = await CoverLetter.findById(id);
    if (!coverLetter) return res.status(404).json({ success: false, message: 'Document not found' });

    if (coverLetter.userId?.toString() !== userId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const analysis = await Analysis.findById(coverLetter.analysisId);
    if (!analysis) return res.status(404).json({ success: false, message: 'Original Analysis not found' });

    const allStrengths = analysis.strengths && analysis.strengths.length > 0 ? analysis.strengths : [];
    const strengthsBulletPoints = allStrengths.map(str => `• ${str}`).join('\n');
    const strengthsInline = allStrengths.slice(0, 3).join(', and ');

    const chosenType = templateType || coverLetter.templateType;
    const { coverLetterText, emailText } = getTemplates(chosenType, companyName || coverLetter.companyName, jobTitle || coverLetter.jobTitle, hrName || coverLetter.hrName, strengthsBulletPoints, strengthsInline);

    coverLetter.companyName = companyName || coverLetter.companyName;
    coverLetter.jobTitle = jobTitle || coverLetter.jobTitle;
    coverLetter.hrName = hrName || coverLetter.hrName;
    coverLetter.templateType = chosenType;
    coverLetter.generatedCoverLetter = coverLetterText;
    coverLetter.generatedEmail = emailText;

    await coverLetter.save();
    res.status(200).json({ success: true, message: 'Document updated successfully!', data: coverLetter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 5. DELETE
// ==========================================
export const deleteCoverLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const coverLetter = await CoverLetter.findById(id);
    if (!coverLetter) return res.status(404).json({ success: false, message: 'Document not found' });

    if (coverLetter.userId?.toString() !== userId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await coverLetter.deleteOne();
    res.status(200).json({ success: true, message: 'Document removed from history successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};