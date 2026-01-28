"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const View_1 = require("../services/View");
const DB_1 = __importDefault(require("../services/DB"));
class Controller {
    async index(request, response) {
        if (request.cookies.auth_id) {
            const session = await DB_1.default.from("sessions").where("id", request.cookies.auth_id).first();
            if (session) {
                const user = await DB_1.default.from("users").where("id", session.user_id).select(["id", "name", "email"]).first();
                if (user) {
                    return response.inertia("CreatePost", { user });
                }
            }
        }
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