// Query 8
// Find the city average friend count per user using MapReduce.

let city_average_friendcount_mapper = function () {
    // each document emits a key-value pair of city and an object with the count and friendCount
    emit(this.hometown.city, {"userCount": 1, "friendCount": this.friends.length});
};

let city_average_friendcount_reducer = function (key, values) {
    // each value is an object with a count and friendCount
    let userCount = 0;
    let friendCount = 0;
    values.forEach((value) => {
        userCount += value.count;
        friendCount += value.friendCount;
    });
    return {"userCount": userCount, "friendCount": friendCount};

};

let city_average_friendcount_finalizer = function (key, reduceVal) {
    var result = reduceVal.friendCount / reduceVal.userCount;
    return reduceVal;
};
