import dns from 'dns/promises';
import { smtpCheck } from './smtpCheck.js';
import { getDidYouMean } from './didYouMean.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
    if (!email || typeof email !== "string") return false;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;

    if (email.includes("..")) return false;
    if ((email.match(/@/g) || []).length !== 1) return false;

    return true;
}

export default async function verifyEmail(email) {
    const start = Date.now();

    const result = {
        email,
        result: "invalid",
        resultcode: 6,
        subresult: "invalid_syntax",
        domain: null,
        mxRecords: [],
        executiontime: 0,
        error: null,
        timestamp: new Date().toISOString(),
        didyoumean: null
    };

    if (!isValidEmail(email)) {
        result.executiontime = (Date.now() - start) / 1000;
        return result;
    }

    const [_, domain] = email.split("@");
    result.domain = domain;

    const typo = getDidYouMean(email);
    if (typo) {
        result.didyoumean = typo;
        result.subresult = "typo_detected";
    }

    try {
        const mx = await dns.resolveMx(domain);
        result.mxRecords = mx.map(r => r.exchange);

        if (!mx.length) throw new Error("No MX records");

        const smtp = await smtpCheck(mx[0].exchange, email);

        if (smtp.valid === true) {
            result.result = "valid";
            result.resultcode = 1;
            result.subresult = "mailbox_exists";
        } else if (smtp.code === 550) {
            result.result = "invalid";
            result.resultcode = 6;
            result.subresult = "mailbox_does_not_exist";
        } else {
            result.result = "unknown";
            result.resultcode = 3;
            result.subresult = "connection_error";
        }

    } catch (err) {
        result.result = "unknown";
        result.resultcode = 3;
        result.subresult = "dns_or_smtp_error";
        result.error = err.message;
    }

    result.executiontime = (Date.now() - start) / 1000;
    return result;
}
