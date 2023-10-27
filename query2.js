// Query 2
// Unwind friends and create a collection called 'flat_users' where each document has the following schema:
// {
//   user_id:xxx
//   friends:xxx
// }
// Return nothing.

function unwind_friends(dbname) {
    db = db.getSiblingDB(dbname);

    // TODO: unwind friends
    db.users.aggregate([
        // unwind friends array, creating a document for each friend
        {$unwind: "$friends"},
        {
            // Reshapes each document in the stream by restricting the content for each document based on the specified conditions
            $project: {
                _id:0,
                user_id: 1,
                friends: 1,
            }
        },
        {$out: "flat_users"}
    ]);

    return;
}
