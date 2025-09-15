import {Vine} from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomErrorReporter.js";


const vine = new Vine()
vine.errorReporter = () => new CustomErrorReporter


export const newsSchema = vine.object({
    title : vine.string().minLength(5).maxLength(190),
    content : vine.string().minLength(10).maxLength(30000),
})
