
const exceptionHandler = process.on('uncaughtException', (reason, promise) => {
    const message = `Promise rejeitada e não tratada (${promise}). Motivo: ${reason}`;
    console.log(message);
});