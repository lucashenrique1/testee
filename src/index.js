const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

//Middleware
function verifyCpfExist(res, req, next) {
    const { cpf } = res.headers;
    const clientStatement = customers.find(statementClient => statementClient.cpf === cpf);

    if (!clientStatement) {
        req.status(400).json({ "message": "Clente não encontrado" });
    }
    res.clientStatement = clientStatement;

    return next();
}

app.post("/account", (req, res) => {
    const { cpf, name } = req.body;
    const checkCpf = customers.some(costomer => costomer.cpf === cpf);

    if (checkCpf) {
        console.log(checkCpf);
        res.status(400).send("Cpf já cadastrado!");
    } else {
        customers.push({
            cpf,
            name,
            uid: uuid(),
            statement: [],
        })
        res.status(201).send("Usuario criado com sucesso!");
    }
});

app.get("/statement", verifyCpfExist, (res, req) => {
    const { clientStatement } = res;
    req.json(clientStatement.statement);

})

app.post("/deposit", verifyCpfExist, (req, res) => {
    const { description, amount } = req.body;
    const { clientStatement } = req;

    const statementOpration = {
        description,
        amount,
        create_at: new Date(),
        type: "credit",
    }
    clientStatement.statement.push(statementOpration);

    res.status(201).send();
})

app.get("/statement/date", verifyCpfExist, (req, res) => {
    const { clientStatement } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");

    const statementForDate = clientStatement.statement.filter(
        (trasActionForDate) => trasActionForDate.create_at.toDateString()
            === new Date(dateFormat).toDateString());

    res.status(200).json(statementForDate);

})

app.put("/account/edit", verifyCpfExist, (req, res) => {
    const { clientStatement } = req;
    const { name } = req.body;

    clientStatement.name = name;

    res.status(201).send();
})
app.get("/account/perfil", verifyCpfExist, (req, res) => {
    const { clientStatement } = req;
    res.status(200).json(clientStatement);
})

app.delete("/account/delete", verifyCpfExist, (req, res) => {
    const { clientStatement } = req;

    customers.splice(clientStatement, 1);

    res.status(200).json(customers);
})

app.listen(3333);