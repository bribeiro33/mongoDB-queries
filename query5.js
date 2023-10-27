// // Query 5
// // Find the oldest friend for each user who has a friend. For simplicity,
// // use only year of birth to determine age, if there is a tie, use the
// // one with smallest user_id. You may find query 2 and query 3 helpful.
// // You can create selections if you want. Do not modify users collection.
// // Return a javascript object : key is the user_id and the value is the oldest_friend id.
// // You should return something like this (order does not matter):
// // {user1:userx1, user2:userx2, user3:userx3,...}

function oldest_friend(dbname) {
    db = db.getSiblingDB(dbname);

    // Get all users upfront
    const allUsers = db.users.find().toArray();

    // Create a mapping of user_id to their YOB for quick lookups
    const userYOB = {};
    allUsers.forEach(user => {
        userYOB[user.user_id] = user.YOB;
    });

    // Flatten the user-friend relationships
    // For each user, create two records: one from user to friend and one from friend to user
    const flattened = [];
    allUsers.forEach(user => {
        user.friends.forEach(friend_id => {
            flattened.push({ "user_id": user.user_id, "friend_id": friend_id });
            flattened.push({ "user_id": friend_id, "friend_id": user.user_id });
        });
    });

    let results = {};

    // For each user, determine their oldest friend
    allUsers.forEach(user => {
        // Filter out the relationships to get only the current user's friends
        const friendsOfUser = flattened.filter(record => record.user_id === user.user_id);

        let oldestFriendId = null; // Store oldest friend's user_id
        let oldestYear = Infinity; // Store oldest friend's YOB
        
        // Iterate through each of the user's friends
        friendsOfUser.forEach(friend => {
            const friendYOB = userYOB[friend.friend_id];
            if (friendYOB < oldestYear) {
                oldestYear = friendYOB;
                oldestFriendId = friend.friend_id;
            } else if (friendYOB === oldestYear && friend.friend_id < oldestFriendId) {
                // If YOBs are the same, compare IDs to choose the friend with a lower ID
                oldestFriendId = friend.friend_id;
            }
        });

        // If an oldest friend was found, add it to the results
        if (oldestFriendId !== null) {
            results[user.user_id] = oldestFriendId;
        }
    });

    return results;
}
