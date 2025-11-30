import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "deviceLabel",
})
export class DeviceLabelPipe implements PipeTransform {
    transform(value: unknown): unknown {
        if (typeof value === "string") {
            return value.replace(/\s*\([0-9a-fA-F]{4}:[0-9a-fA-F]{4}\)$/, "");
        }
        
        return null;
    }
}
