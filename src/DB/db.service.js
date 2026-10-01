export const create = async ({ model, data, options = {} }) => {
    return await model.create([data], options);
};
export const findOne = async ({ model, filter, options = {} }) => {
    return await model.findOne(filter, options);
};
