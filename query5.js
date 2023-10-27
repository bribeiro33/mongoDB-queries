// Query 5
// Find the oldest friend for each user who has a friend. For simplicity,
// use only year of birth to determine age, if there is a tie, use the
// one with smallest user_id. You may find query 2 and query 3 helpful.
// You can create selections if you want. Do not modify users collection.
// Return a javascript object : key is the user_id and the value is the oldest_friend id.
// You should return something like this (order does not matter):
// {user1:userx1, user2:userx2, user3:userx3,...}

function oldest_friend(dbname) {
    db = db.getSiblingDB(dbname);

    let results = {};
    // TODO: implement oldest friends
    // First, we get the friendships from the user's perspective
    let allFriendships = [];
    db.users.find({}).forEach(function(user) {
        user.friends.forEach(function(friend) {
            allFriendships.push({ 
                userId: user._id, 
                friendId: friend._id, 
                friendYOB: friend.year_of_birth 
            });
        });
    });

    // Sort the friendships by friend's YOB (oldest first) and then by friend's ID (smallest first)
    allFriendships.sort((a, b) => {
        if (a.friendYOB !== b.friendYOB) {
            return b.friendYOB - a.friendYOB;  // Oldest friends first
        }
        return a.friendId - b.friendId;  // Smallest IDs first
    });

    // Finally, pick the oldest friend for each user
    allFriendships.forEach(friendship => {
        if (!results[friendship.userId]) {
            results[friendship.userId] = friendship.friendId;
        }
    });
    return results;
}
