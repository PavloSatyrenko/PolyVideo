import { DeviceLabelPipe } from "./device-label-pipe";

describe("DeviceLabelPipe", () => {
    it("create an instance", () => {
        const pipe = new DeviceLabelPipe();
        expect(pipe).toBeTruthy();
    });
});
