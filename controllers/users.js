import { v4 as uuid } from 'uuid';

let users = [];

export const getUsers = (req, res) => {
    res.status(200).json(users);
};

export const createUser = (req, res) => {
    const { username, age } = req.body;

    if (!username || age === undefined) {
        return res.status(400).json({ message: 'username and age are required' });
    }

    const user = { id: uuid(), username, age };
    users.push(user);

    console.log(`User [${username}] added to the database.`);
    res.status(201).json(user);
};

export const getUser = (req, res) => {
    const user = users.find((user) => user.id === req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    res.status(200).json(user);
};

export const deleteUser = (req, res) => {
    const user = users.find((user) => user.id === req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    users = users.filter((user) => user.id !== req.params.id);

    console.log(`User with id ${req.params.id} has been deleted.`);
    res.status(200).json({ message: `User with id ${req.params.id} deleted successfully` });
};

export const updateUser = (req, res) => {
    const user = users.find((user) => user.id === req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User with id ${req.params.id} not found` });
    }

    const { username, age } = req.body;

    if (username) user.username = username;
    if (age !== undefined) user.age = age;

    console.log(`User with id ${req.params.id} has been updated.`);
    res.status(200).json(user);
};
