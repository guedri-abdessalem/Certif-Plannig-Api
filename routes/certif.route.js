const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const certifModel = require('../models/certif.model');
const requireAdmin = require('../middleware/require-admin');
const CertifController = require('../controllers/certif.controller');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }));

// routes for admins only
router.route('/').post(requireAdmin, asyncHandler(CertifController.create));
router.route('/:certifId').delete(requireAdmin, asyncHandler(CertifController.deleteCertif));
router.route('/:certifId/users').get(requireAdmin, asyncHandler(CertifController.retrieveUsersFromCertif));
router.route('/:certifId/test').post(asyncHandler(requireAdmin, CertifController.addTest));
router.route('/:certifId/test/:testId').get(asyncHandler(requireAdmin, CertifController.retrieveTestChooser));
router.route('/:certifId/test/:testId').delete(asyncHandler(requireAdmin, CertifController.removeTest));

// routes for all types of users
router.route('/').get(asyncHandler(CertifController.retrieveAll));
router.route('/:certifId').get(asyncHandler(CertifController.retrieveOne));
router.route('/:certifId/select').patch(asyncHandler(CertifController.selectCertif));
router.route('/:certifId/test').get(asyncHandler(CertifController.retrieveTestsByCertif));
router.route('/:certifId/test/:testId/choose').patch(asyncHandler(CertifController.chooseTestTiming));