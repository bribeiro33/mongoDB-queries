import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.TreeSet;
import java.util.Vector;

import org.json.JSONObject;
import org.json.JSONArray;

public class GetData {

    static String prefix = "project3.";

    // You must use the following variable as the JDBC connection
    Connection oracleConnection = null;

    // You must refer to the following variables for the corresponding 
    // tables in your database
    String userTableName = null;
    String friendsTableName = null;
    String cityTableName = null;
    String currentCityTableName = null;
    String hometownCityTableName = null;

    // DO NOT modify this constructor
    public GetData(String u, Connection c) {
        super();
        String dataType = u;
        oracleConnection = c;
        userTableName = prefix + dataType + "_USERS";
        friendsTableName = prefix + dataType + "_FRIENDS";
        cityTableName = prefix + dataType + "_CITIES";
        currentCityTableName = prefix + dataType + "_USER_CURRENT_CITIES";
        hometownCityTableName = prefix + dataType + "_USER_HOMETOWN_CITIES";
    }

    // TODO: Implement this function
    @SuppressWarnings("unchecked")
    public JSONArray toJSON() throws SQLException {

        // This is the data structure to store all users' information
        JSONArray users_info = new JSONArray();
        
        try (Statement stmt = oracleConnection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY)) {
            // Your implementation goes here....
            // Get all user info
            // id, firstname, lastname, DOB, MOB, YOB, gender
            ResultSet rst = stmt.executeQuery("SELECT * FROM " + userTableName);

            // Convert all user's info to JSON
            // each iteration is a diff user
            while (rst.next()){
                JSONObject user = new JSONObject();
                
                long userId = rst.getLong(1);
                String firstName = rst.getString(2);
                String lastName = rst.getString(3);
                int yob = rst.getInt(4);
                user.put("MOB", rst.getInt(5));
                int dob = rst.getInt(6);
                String gender = rst.getString(7);

                try (Statement stmtInner = oracleConnection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY)) {
                    
                    // Get user's hometown
                    JSONObject hometown = new JSONObject();
                    ResultSet hometown_rst = stmtInner.executeQuery(
                        "SELECT C.CITY_NAME, C.STATE_NAME, C.COUNTRY_NAME " + 
                        "FROM " + cityTableName + " C, " + hometownCityTableName + " H " +
                        "WHERE C.CITY_ID = H.HOMETOWN_CITY_ID AND H.USER_ID = " + userId
                    );


                    if (hometown_rst.next()) {
                        hometown.put("country", hometown_rst.getString(3));
                        hometown.put("city", hometown_rst.getString(1));
                        hometown.put("state", hometown_rst.getString(2));
                    }
                    user.put("hometown", hometown);
                    hometown_rst.close();
                    // Get user's current city
                    JSONObject current_city = new JSONObject();
                    ResultSet current_city_rst = stmtInner.executeQuery(
                        "SELECT C.CITY_NAME, C.STATE_NAME, C.COUNTRY_NAME " + 
                        "FROM " + cityTableName + " C, " + currentCityTableName + " H " +
                        "WHERE C.CITY_ID = H.CURRENT_CITY_ID AND H.USER_ID = " + userId
                    );
                    if (current_city_rst.next()) {
                        current_city.put("country", current_city_rst.getString(3));
                        current_city.put("city", current_city_rst.getString(1));
                        current_city.put("state", current_city_rst.getString(2));
                    }
                    user.put("current_city", current_city);
                    
                    user.put("gender", gender);
                    user.put("user_id", userId);
                    user.put("DOB", dob);
                    user.put("last_name", lastName);
                    user.put("first_name", firstName);
                    user.put("YOB", yob);

                    //Get user's friends, JSON ARRAY of ids
                    JSONArray friends = new JSONArray();
                    ResultSet friends_rst = stmtInner.executeQuery(
                        "SELECT USER2_ID " + 
                        "FROM " + friendsTableName + " " +
                        "WHERE USER1_ID = " + userId
                    );

                    while (friends_rst.next()) {
                        friends.put(friends_rst.getLong(1));
                    }
                    user.put("friends", friends);

                    stmtInner.close();
                } catch (SQLException e) {
                    System.err.println(e.getMessage());
                }
                users_info.put(user);
                

            }
            
            stmt.close();
        } catch (SQLException e) {
            System.err.println(e.getMessage());
        }

        return users_info;
    }

    // This outputs to a file "output.json"
    // DO NOT MODIFY this function
    public void writeJSON(JSONArray users_info) {
        try {
            FileWriter file = new FileWriter(System.getProperty("user.dir") + "/output.json");
            file.write(users_info.toString());
            file.flush();
            file.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
