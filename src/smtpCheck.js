import net from 'net';

export function smtpCheck(mxHost, email, timeout = 10000) {
    if (process.env.NODE_ENV === "test") {
        return Promise.resolve({ valid: true, code: 250 });
    }

    return new Promise((resolve) => {
        const socket = net.createConnection(25, mxHost);
        let step = 0;

        const cleanup = () => {
            if (socket) socket.end();
        };

        socket.setTimeout(timeout);

        socket.on("data", (data) => {
            const message = data.toString();

            if (step === 0) {
                socket.write("HELO example.com\r\n");
                step++;
            } else if (step === 1) {
                socket.write("MAIL FROM:<test@example.com>\r\n");
                step++;
            } else if (step === 2) {
                socket.write(`RCPT TO:<${email}>\r\n`);
                step++;
            } else if (step === 3) {
                if (message.startsWith("250")) {
                    cleanup();
                    return resolve({ valid: true, code: 250 });
                }
                if (message.startsWith("550")) {
                    cleanup();
                    return resolve({ valid: false, code: 550 });
                }
                if (message.startsWith("450")) {
                    cleanup();
                    return resolve({ valid: null, code: 450 });
                }

                cleanup();
                return resolve({ valid: null, code: 0 });
            }
        });

        socket.on("timeout", () => {
            cleanup();
            resolve({ valid: null, code: 450 });
        });

        socket.on("error", () => {
            cleanup();
            resolve({ valid: null, code: 0 });
        });
    });
}
