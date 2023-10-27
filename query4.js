// Query 4
// Find user pairs (A,B) that meet the following constraints:
// i) user A is male and user B is female
// ii) their Year_Of_Birth difference is less than year_diff
// iii) user A and B are not friends
// iv) user A and B are from the same hometown city
// The following is the schema for output pairs:
// [
//      [user_id1, user_id2],
//      [user_id1, user_id3],
//      [user_id4, user_id2],
//      ...
//  ]
// user_id is the field from the users collection. Do not use the _id field in users.
// Return an array of arrays.

function suggest_friends(year_diff, dbname) {
    db = db.getSiblingDB(dbname);

    let pairs = [];
    db.users.find().forEach(element => {
        const obj = JSON.parse(JSON.stringify(element));
        if (obj.gender === "male") {
            db.users.find({
                "gender": "female", "YOB": { $gt: obj.YOB - year_diff, $lt: obj.YOB + year_diff }, "hometown.city": obj.hometown.city, "user_id": { $nin: obj.friends }
            }).forEach((e) => {
                if (e.friends.indexOf(obj.user_id) === -1) {
                    pairs.push([obj.user_id, e.user_id]);
                }
            });
        }
    });
    // Query male users
    // db.users.find({ "gender": "male" }).forEach(function(userA) {
    //     // For each male user, find female users that meet the criteria
    //     db.users.find({
    //         "gender": "female",
    //         "hometown.city": userA.hometown.city,
    //         "YOB": { 
    //             $gte: userA.YOB- year_diff, 
    //             $lte: userA.YOB + year_diff 
    //         },
    //         "_id": { $ne: userA._id },  // Ensure it's not the same user
    //         "friends": { $ne: userA._id }  // Ensure they are not already friends
    //     }).forEach(function(userB) {
    //         if (userA.friends.indexOf(userB._id) == -1 && userB.friends.indexOf(userA._id) == -1) {
    //             // If userB is not a friend of userA, add the pair to the pairs array
    //             pairs.push([userA._id, userB._id]);
    //         }
    //     });
        
    // });
    // let results = db.users.aggregate([
    //     // Match only male users first to make sure user1 is male
    //     {
    //         $match: { gender: "male" }
    //     },
    //     // Join on the same collection to get potential friend pairs
    //     {
    //         $lookup: {
    //             from: "users",
    //             let: { male_id: "$user_id", friends: "$friends", yob: "$YOB", hometown: "$hometown"},
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $and: [
    //                                 { $eq: ["$gender", "female"] },  // female
    //                                 { $eq: ["$hometown.city", "$$hometown.city"] },  // Same hometown
    //                                 { $gte: ["$YOB", { $subtract: ["$$yob", year_diff] }] },  // YOB within range
    //                                 { $lte: ["$YOB", { $add: ["$$yob", year_diff] }] },  // YOB within range
    //                                 { $not: [ { $in: ["$user_id", "$$friends"] } ] } // Not already friends
    //                             ]
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $project: { _id: 0, user_id: 1 } // Only keep user_id for potential friends
    //                 }
    //             ],
    //             as: "potential_friends"
    //         }
    //     },
    //     // Unwind the potential friends
    //     {
    //         $unwind: "$potential_friends"
    //     },
    //     // Project to get the desired format
    //     {
    //         $project: {
    //             pair: ["$user_id", "$potential_friends.user_id"]
    //         }
    //     }
    // ]).toArray();

    // // Extract pairs to get an array of arrays
    // pairs = results.map(r => r.pair);

    return pairs;
}
