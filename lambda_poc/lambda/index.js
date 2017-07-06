exports.handler = (event, context, callback) => {
    let salary = event.salary;

    let final_salary = salary - ((salary * process.env.salary_taxes) / 100);

    callback(null, {
        body: JSON.stringify({
            salary: salary,
            salary_after_taxes: final_salary,
            message: 'Final salary will be ' + final_salary + ' and the taxes percent is ' + process.env.salary_taxes + '%'
        }),
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true
        }
    });
};