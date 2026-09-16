"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weatherController_1 = require("../controllers/weatherController");
const router = (0, express_1.Router)();
router.get('/', (req, res) => weatherController_1.weatherController.getWeather(req, res));
router.get('/cities', (req, res) => weatherController_1.weatherController.getMajorCities(req, res));
exports.default = router;
//# sourceMappingURL=weatherRoutes.js.map