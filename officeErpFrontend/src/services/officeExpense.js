import api from "../core/api"

export const getOfficeExpense = async (params) => {
    try {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );

        const queryString = new URLSearchParams(cleanParams).toString();

        const response = api.get(`/user/getAllExpense?expense_type=Office%20Expense&${queryString}`);
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}

export const createOfficeExpense = async (endPoint, data) => {
    try {
        const response = api.post(`/${endPoint}create?expenseType=office`, data);
        return response;
    } catch (error) {
        console.error("Error creating member:", error);
    }
}

export const updateOfficeExpense = async (endPoint, id, data) => {
    try {
        const response = api.post(`/${endPoint}/update?expense_type=Office%20Expense&id=${id}`, data);
        return response;
    } catch (error) {
        console.error("Error updating member:", error);
    }
}

export const getExpenseHead = async () => {
    try {
        const response = api.get("/expenseHeadOfAccount/list?expenseType=officeExpense");
        return response;
    } catch (error) {
        console.error("Error fetching members:", error);
    }
}