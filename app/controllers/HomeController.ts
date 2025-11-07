import { Response, Request } from "../../type"; 
import { view } from "../services/View";

class Controller {
    
    public async index (request : Request,response : Response) { 
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
