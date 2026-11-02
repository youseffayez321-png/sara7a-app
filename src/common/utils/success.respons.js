export const success_respons = ({
    res,
    statusCode = 200,
    message = "done",
    data = undefined,
}) => {
    return res.status(statusCode).json({ message, data });
};
