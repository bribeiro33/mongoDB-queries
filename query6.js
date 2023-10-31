// Query 6
// Find the average friend count per user.
// Return a decimal value as the average user friend count of all users in the users collection.

function find_average_friendcount(dbname) {
    db = db.getSiblingDB(dbname);

    
    let result = db.users.aggregate([
        // Unwind the friends list
        {
            // generates a doc for each friend in the friends array of each user
            $unwind: {
                path: "$friends",
                preserveNullAndEmptyArrays: true // count users with 0/null friends
            }
        },
        {
            $project: {
                user_id: 1,
                // If friends isn't null, return 1, else return 0, will pass into count
                actualFriend: { $cond: [ { $ifNull: [ "$friends", false ] }, 1, 0 ] }
            }
        },
        // Group by user_id and count the actual number of friends each user has
        {
            $group: {
                _id: "$user_id",
                friendCount: { $sum: "$actualFriend" }
            }
        },
        // Group by user_id and count the number of friends each user has
        // {
        //     $group: {
        //         _id: "$user_id",
        //         friendCount: { $sum: 1 }
        //     }
        // },
        // Group again to calculate the average across all users
        {
            $group: {
                _id: null,
                averageFriendCount: { $avg: "$friendCount" }
            }
        },
        // Project to only return the average
        {
            $project: {
                _id: 0,
                averageFriendCount: 1
            }
        }
    ]).toArray();

    if (result.length > 0) {
        return result[0].averageFriendCount;
    } else {
        return 0;
    }
}

