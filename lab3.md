# Lab Day 3: Transforming the Server

In this lab, you will transform the server you created on Day 2, which currently stores data in JSON files using the file system, into a server that connects to MongoDB using Mongoose.

## Objectives

1. **Connect to MongoDB**:

   - Use Mongoose to establish a connection to your MongoDB database.

2. **Create User Schema**:

   - Define a Mongoose schema for users.
     ```javascript
     const userSchema = new mongoose.Schema({
       name: String,
       email: String,
       password: String,
       role: String,
     });
     ```

3. **Create Post Schema**:

   - Define a Mongoose schema for posts.
     ```javascript
     const postSchema = new mongoose.Schema({
       title: String,
       content: String,
       userId: String, // also you can here make a referencing between the two models (bonus if you did it)
     });
     ```

4. **Validations**:

   - You should apply different validations for each property in the schemas to ensure data integrity and enforce rules on the data being stored.

5. **Environment Variables**(bonus):

   - Use environment variables to store sensitive information such as your MongoDB connection string.
   - Make sure to create a `.env` file in your project root and add it to your `.gitignore` file to prevent it from being tracked by Git.

## Additional Notes

- Ensure that you have the necessary packages installed, such as `mongoose`.
- Follow best practices for structuring your code and handling errors when connecting to the database.

Good luck with your transformation!
