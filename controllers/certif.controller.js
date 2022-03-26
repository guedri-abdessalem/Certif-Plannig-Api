const bcrypt = require('bcrypt');
const Joi = require('joi');
const certifModel = require('../models/certif.model');
const Certif = require('../models/certif.model');
const testDateModel = require('../models/testDate.model');
const userModel = require('../models/user.model');

const CertifSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

const TestDateSchema = Joi.object({
  plannedDate: Joi.date().required(),
  duration: Joi.number().required(),
});


const CertifController = {

  retrieveAll: async (req, res) => {
    const certifs = await certifModel.find({}).populate('testDates');

    try {
      res.send(certifs);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  retrieveOne: async (req, res) => {

    const certif = await certifModel.findById(req.params.certifId);

    try {
      res.send(certif);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  create: async (req, res) => {
    let certif = await CertifSchema.validateAsync(req.body, { abortEarly: false });
    res = await new Certif(certif).save();
    return res.json(res);
  },

  deleteCertif: async (req, res) => {
    await userModel.findByIdAndUpdate(
      req.user._id,
      { $pull: { selectedCertifs: req.params.certifId } },
    );

    await testDateModel.deleteMany({ certif: req.params.certifId });
    await certifModel.findByIdAndDelete(req.params.certifId);

    res.status(202).send();
  },

  retrieveTestDatesByCertif: async (req, res) => {

    const certif = await certifModel.findById(req.params.certifId).populate("testDates");

    try {
      res.send(certif.testDates);
    } catch (error) {
      res.status(500).send(error);
    }
  },
  retrieveUsersFromCertif: async (req, res) => {

    const certif = await certifModel.findById(req.params.certifId).populate("selectedBy", "-roles");

    try {
      res.send(certif.selectedBy);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  addTestDate: async (req, res) => {
    let testDate = await TestDateSchema.validateAsync(req.body, { abortEarly: false });
    testDate.certif = req.params.certifId;
    newTestDate = await new testDateModel(testDate).save();
    const certif = await certifModel.findById(req.params.certifId);
    certif.testDates.push(newTestDate);
    await certif.save();
    return res.json(newTestDate);
  },

  selectCertif: async (req, res) => {

    let certif = await certifModel.findByIdAndUpdate(
      req.params.certifId,
      { $push: { selectedBy: req.user._id } },
      { new: true, useFindAndModify: false }
    );

    user = await userModel.findByIdAndUpdate(
      req.user._id,
      { $push: { selectedCertifs: certif._id } },
      { new: true, useFindAndModify: false }
    );

    return res.send(certif);
  },

  chooseTestDateTiming: async (req, res) => {

    let testDate = await testDateModel.findByIdAndUpdate(
      req.params.testDateId,
      { $push: { subscribedUsers: req.user._id } },
      { new: true, useFindAndModify: false }
    );

    user = await userModel.findByIdAndUpdate(
      req.user._id,
      { $push: { testDatesPlanned: testDate._id } },
      { new: true, useFindAndModify: false }
    );
    return res.send(testDate);
  },

  retrieveTestDateChooser: async (req, res) => {

    const testDate = await testDateModel.findById(req.params.testDateId).populate("subscribedUsers");

    try {
      res.send(testDate.subscribedUsers);
    } catch (error) {
      sh
      res.status(500).send(error);
    }
  },

  removeTestDate: async (req, res) => {
    await userModel.findByIdAndUpdate(
      req.user._id,
      { $pull: { testDatesPlanned: req.params.testDateId } },
    );

    await certifModel.findByIdAndUpdate(
      req.params.certifId,
      { $pull: { testDates: req.params.testDateId } },
    );

    await testDateModel.findByIdAndDelete(req.params.testDateId);


    res.status(202).send();
  }

}

module.exports = CertifController;
