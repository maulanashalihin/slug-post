"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const View_1 = require("../services/View");
class Controller {
    async index(request, response) {
        return response.type("html").send((0, View_1.view)("index.html"));
    }
    async about(request, response) {
        return response.type("html").send((0, View_1.view)("about.html"));
    }
    async docs(request, response) {
        return response.type("html").send((0, View_1.view)("docs.html"));
    }
    async tos(request, response) {
        return response.type("html").send((0, View_1.view)("tos.html"));
    }
    async privacy(request, response) {
        return response.type("html").send((0, View_1.view)("privacy.html"));
    }
}
exports.default = new Controller();
//# sourceMappingURL=HomeController.js.map