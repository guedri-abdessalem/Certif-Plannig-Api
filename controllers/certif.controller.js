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

  retrieveAll: async (request, response) => {
    const certifs = await certifModel.find({}).populate('testDates');

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

    await testDateModel.deleteMany({ certif: request.params.certifId });
    await certifModel.findByIdAndDelete(request.params.certifId);

    response.status(202).send();
  },

  retrieveTestDatesByCertif: async (request, response) => {

    const certif = await certifModel.findById(request.params.certifId).populate("testDates");

    try {
      response.send(certif.testDates);
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

  addTestDate: async (request, response) => {
    let testDate = await TestDateSchema.validateAsync(request.body, { abortEarly: false });
    testDate.certif = request.params.certifId;
    newTestDate = await new testDateModel(testDate).save();
    const certif = await certifModel.findById(request.params.certifId);
    certif.testDates.push(newTestDate);
    await certif.save();
    return response.json(newTestDate);
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

  chooseTestDateTiming: async (request, response) => {

    let testDate = await testDateModel.findByIdAndUpdate(
      request.params.testDateId,
      { $push: { subscribedUsers: request.user._id } },
      { new: true, useFindAndModify: false }
    );

    user = await userModel.findByIdAndUpdate(
      request.user._id,
      { $push: { testDatesPlanned: testDate._id } },
      { new: true, useFindAndModify: false }
    );
    return response.send(testDate);
  },

  retrieveTestDateChooser: async (request, response) => {

    const testDate = await testDateModel.findById(request.params.testDateId).populate("subscribedUsers");

    try {
      response.send(testDate.subscribedUsers);
    } catch (error) {
      sh
      response.status(500).send(error);
    }
  },

  removeTestDate: async (request, response) => {
    await userModel.findByIdAndUpdate(
      request.user._id,
      { $pull: { testDatesPlanned: request.params.testDateId } },
    );

    await certifModel.findByIdAndUpdate(
      request.params.certifId,
      { $pull: { testDates: request.params.testDateId } },
    );

    await testDateModel.findByIdAndDelete(request.params.testDateId);


    response.status(202).send();
  }

}

module.exports = CertifController;
