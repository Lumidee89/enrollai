const Application = require('../models/applicationModel');
const User = require('../models/User'); 

exports.selectApplicationType = async (req, res) => {
  const { userId, applicationType } = req.body;
  
  try {
    const application = new Application({ userId, applicationType, step: 1 });
    await application.save();
    res.status(200).json({ msg: 'Application type saved, proceed to Step 2', application });
  } catch (error) {
    res.status(500).json({ error: 'Server error in Step 1' });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  const { userId } = req.body;
  const personalInfo = req.body;

  try {
    const application = await Application.findOneAndUpdate(
      { userId, step: 1 }, 
      { $set: { personalInfo, step: 2 } }, 
      { new: true }
    );
    if (!application) return res.status(404).json({ msg: 'Application not found or incorrect step' });
    res.status(200).json({ msg: 'Personal info updated, proceed to Step 3', application });
  } catch (error) {
    res.status(500).json({ error: 'Server error in Step 2' });
  }
};

exports.updatePracticeLocations = async (req, res) => {
  const { userId } = req.body;
  const practiceLocations = req.body.practiceLocations;

  try {
    const application = await Application.findOneAndUpdate(
      { userId, step: 2 },
      { $set: { practiceLocations, step: 3 } },
      { new: true }
    );
    if (!application) return res.status(404).json({ msg: 'Application not found or incorrect step' });
    res.status(200).json({ msg: 'Practice locations updated, application completed', application });
  } catch (error) {
    res.status(500).json({ error: 'Server error in Step 3' });
  }
};
