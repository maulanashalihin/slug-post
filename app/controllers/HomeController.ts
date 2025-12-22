import { Response, Request } from "../../type"; 
import { view } from "../services/View";
import DB from "../services/DB";

class Controller {
    
    public async index (request : Request, response : Response) { 
        // Check if user is logged in
        if (request.cookies.auth_id) {
            const session = await DB.from("sessions").where("id", request.cookies.auth_id).first();
            if (session) {
                const user = await DB.from("users").where("id", session.user_id).select(["id", "name", "email"]).first();
                if (user) {
                    return response.inertia("CreatePost", { user });
                }
            }
        }
        
        // Not logged in - show public HTML page
        return response.type("html").send(view("index.html"));
    }

    public async about (request : Request,response : Response) { 
        return response.type("html").send(view("about.html"));
    }

    public async docs (request : Request,response : Response) { 
        return response.type("html").send(view("docs.html"));
    }

    public async tos (request : Request,response : Response) { 
        return response.type("html").send(view("tos.html"));
    }

    public async privacy (request : Request,response : Response) { 
        return response.type("html").send(view("privacy.html"));
    }
}

export default new Controller()
