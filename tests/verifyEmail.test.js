jest.setTimeout(30000);

const { verifyEmail } = require("../src/verifyEmail");
describe("Email Verification Tests", () => {

    test("Valid email format", async () => {
        const res = await verifyEmail("test@gmail.com");
        expect(res.email).toBe("test@gmail.com");
    });

    test("Invalid format - missing @", async () => {
        const res = await verifyEmail("testgmail.com");
        expect(res.result).toBe("invalid");
    });

    test("Invalid format - double dots", async () => {
        const res = await verifyEmail("test..me@gmail.com");
        expect(res.result).toBe("invalid");
    });

    test("Empty string", async () => {
        const res = await verifyEmail("");
        expect(res.result).toBe("invalid");
    });

    test("Null input", async () => {
        const res = await verifyEmail(null);
        expect(res.result).toBe("invalid");
    });

    test("Multiple @ rejected", async () => {
        const res = await verifyEmail("test@@gmail.com");
        expect(res.result).toBe("invalid");
    });

    test("Typo detection gmial → gmail", async () => {
        const res = await verifyEmail("user@gmial.com");
        expect(res.didyoumean).toBe("user@gmail.com");
    });

    test("Very long email", async () => {
        const res = await verifyEmail("a".repeat(100) + "@gmail.com");
        expect(res.email.includes("@")).toBe(true);
    });

    test("Yahoo typo", async () => {
        const res = await verifyEmail("user@yahooo.com");
        expect(res.didyoumean).toBe("user@yahoo.com");
    });

    test("Hotmail typo", async () => {
        const res = await verifyEmail("user@hotmial.com");
        expect(res.didyoumean).toBe("user@hotmail.com");
    });

    test("Outlook typo", async () => {
        const res = await verifyEmail("user@outlok.com");
        expect(res.didyoumean).toBe("user@outlook.com");
    });

    test("Execution time present", async () => {
        const res = await verifyEmail("test@gmail.com");
        expect(res.executiontime).toBeGreaterThanOrEqual(0);
    });

    test("Timestamp exists", async () => {
        const res = await verifyEmail("test@gmail.com");
        expect(res.timestamp).toBeDefined();
    });

    test("Domain extracted", async () => {
        const res = await verifyEmail("test@gmail.com");
        expect(res.domain).toBe("gmail.com");
    });

    test("MX Records array exists", async () => {
        const res = await verifyEmail("test@gmail.com");
        expect(Array.isArray(res.mxRecords)).toBe(true);
    });

});
