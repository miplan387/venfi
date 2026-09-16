"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remesasController_1 = require("../controllers/remesasController");
const router = (0, express_1.Router)();
router.get('/', (req, res) => remesasController_1.remesasController.getRemesas(req, res));
exports.default = router;
//# sourceMappingURL=remesasRoutes.js.map