const bcrypt = require('bcrypt');
const Joi = require('joi');
const certifModel = require('../models/certif.model');
const Certif = require('../models/certif.model');
const testModel = require('../models/test.model');
const userModel = require('../models/user.model');

const CertifSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

const TestSchema = Joi.object({
  plannedDate: Joi.date().required(),
  duration: Joi.number().required(),
});


const CertifController = {

  retrieveAll: async (request, response) => {
    const certifs = await certifModel.find({}).populate('tests');

    try {
      response.send(certifs);
    } catch (error) {
      response.status(500).send(error);
    }
  },

  retrieveOne: async (request, response) => {

    const certif = await certifModel.findById(request.params.certifId);

    try {
      response.send(certif);
    } catch (error) {
      response.status(500).send(error);
    }
  },

  create: async (request, response) => {
    let certif = await CertifSchema.validateAsync(request.body, { abortEarly: false });
    res = await new Certif(certif).save();
    return response.json(res);
  },

  deleteCertif: async (request, response) => {
    await userModel.findByIdAndUpdate(
      request.user._id,
      { $pull: { selectedCertifs: request.params.certifId } },
    );

    await testModel.deleteMany({ certif: request.params.certifId });
    await certifModel.findByIdAndDelete(request.params.certifId);

    response.status(202).send();
  },

  retrieveTestsByCertif: async (request, response) => {

    const certif = await certifModel.findById(request.params.certifId).populate("tests");

    try {
      response.send(certif.tests);
    } catch (error) {
      response.status(500).send(error);
    }
  },
  retrieveUsersFromCertif: async (request, response) => {

    const certif = await certifModel.findById(request.params.certifId).populate("selectedBy", "-roles");

    try {
      response.send(certif.selectedBy);
    } catch (error) {
      response.status(500).send(error);
    }
  },

  addTest: async (request, response) => {
    let test = await TestSchema.validateAsync(request.body, { abortEarly: false });
    test.certif = request.params.certifId;
    newTest = await new testModel(test).save();
    const certif = await certifModel.findById(request.params.certifId);
    certif.tests.push(newTest);
    await certif.save();
    return response.json(newTest);
  },

  selectCertif: async (request, response) => {

    let certif = await certifModel.findByIdAndUpdate(
      request.params.certifId,
      { $push: { selectedBy: request.user._id } },
      { new: true, useFindAndModify: false }
    );

    user = await userModel.findByIdAndUpdate(
      request.user._id,
      { $push: { selectedCertifs: certif._id } },
      { new: true, useFindAndModify: false }
    );

    return response.send(certif);
  },

  chooseTestTiming: async (request, response) => {

    let test = await testModel.findByIdAndUpdate(
      request.params.testId,
      { $push: { subscribedUsers: request.user._id } },
      { new: true, useFindAndModify: false }
    );

    user = await userModel.findByIdAndUpdate(
      request.user._id,
      { $push: { testsPlanned: test._id } },
      { new: true, useFindAndModify: false }
    );
    return response.send(test);
  },

  retrieveTestChooser: async (request, response) => {

    const test = await testModel.findById(request.params.testId).populate("subscribedUsers");

    try {
      response.send(test.subscribedUsers);
    } catch (error) {
      sh
      response.status(500).send(error);
    }
  },

  removeTest: async (request, response) => {
    await userModel.findByIdAndUpdate(
      request.user._id,
      { $pull: { testsPlanned: request.params.testId } },
    );

    await certifModel.findByIdAndUpdate(
      request.params.certifId,
      { $pull: { tests: request.params.testId } },
    );

    await testModel.findByIdAndDelete(request.params.testId);


    response.status(202).send();
  }

}

module.exports = CertifController;
