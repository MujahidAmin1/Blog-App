// // Find one document matching a condition
// const user = await User.findOne({ email: "m@email.com" });
// // returns the document or null

// // Find a document by its _id
// const blog = await Blog.findById("abc123");
// // returns the document or null

// // Find all documents
// const blogs = await Blog.find();
// // returns an array (empty array if none found)

// // Find all + sort
// const blogs = await Blog.find().sort({ createdAt: -1 });
// // -1 = descending (newest first), 1 = ascending (oldest first)

// // Create a document and save it
// const user = new User({ name, email, passwordHash });
// await user.save();

// // Shorter way to create (combines new + save)
// const blog = await Blog.create({ title, content, author: req.userId });

// // Update fields and save
// blog.title = "New Title";
// await blog.save();

// // Delete a document
// await blog.deleteOne();