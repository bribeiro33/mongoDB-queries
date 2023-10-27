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
    
    let pipeline = [
        {
            // Match only male users first to make sure user1 is male
            $match: {
                gender: "male"
            }
        },
        {
            // Join on the same collection to get potential friend pairs
            $lookup: {
                from: "users",
                let: { 
                    male_id: "$user_id",
                    male_YOB: "$YOB",
                    male_city: "$hometown.city",
                    male_friends: "$friends"
                },
                pipeline: [
                    {
                        $match: {
                            gender: "female", // userb must be female
                            $expr: {
                                $and: [
                                    { $gt: ["$YOB", { $subtract: ["$$male_YOB", year_diff] }] }, // difference in YOB < years_diff
                                    { $lt: ["$YOB", { $add: ["$$male_YOB", year_diff] }] }, 
                                    { $eq: ["$hometown.city", "$$male_city"] }, // same hometown
                                    { $and: [ // not already friends
                                        { $not: [{ $in: ["$user_id", "$$male_friends"] }] },
                                        { $not: [{ $in: ["$$male_id", "$friends"] }] }
                                    ]}
                                    
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            female_id: "$user_id",
                            female_friends: "$friends"
                        }
                    }
                ],
                as: "matched_females"
            }
        },
        {
            $unwind: "$matched_females"
        },
        // Unwind the potential friends
        {
            $match: {
                "matched_females.female_friends": { $ne: "$user_id" }
            }
        },
        {
            // Project to get the spec format
            $project: {
                _id: 0,
                pair: ["$user_id", "$matched_females.female_id"]
            }
        }
    ];
    
    let results = db.users.aggregate(pipeline).toArray();
    // Extract pairs to get an array of arrays
    let pairs = results.map(res => res.pair);
    
    return pairs;
}
