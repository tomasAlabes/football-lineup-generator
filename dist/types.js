export var Team;
(function (Team) {
    Team["RED"] = "red";
    Team["YELLOW"] = "yellow";
})(Team || (Team = {}));
export var Position;
(function (Position) {
    Position["GOALKEEPER"] = "goalkeeper";
    // Defenders
    Position["CENTER_BACK"] = "center_back";
    Position["LEFT_CENTER_BACK"] = "left_center_back";
    Position["RIGHT_CENTER_BACK"] = "right_center_back";
    Position["LEFT_BACK"] = "left_back";
    Position["RIGHT_BACK"] = "right_back";
    Position["LEFT_WING_BACK"] = "left_wing_back";
    Position["RIGHT_WING_BACK"] = "right_wing_back";
    // Midfielders
    Position["DEFENSIVE_MIDFIELDER"] = "defensive_midfielder";
    Position["CENTER_MIDFIELDER"] = "center_midfielder";
    Position["ATTACKING_MIDFIELDER"] = "attacking_midfielder";
    Position["LEFT_MIDFIELDER"] = "left_midfielder";
    Position["RIGHT_MIDFIELDER"] = "right_midfielder";
    // Wingers
    Position["LEFT_WINGER"] = "left_winger";
    Position["RIGHT_WINGER"] = "right_winger";
    // Forwards
    Position["STRIKER"] = "striker";
    Position["SECOND_STRIKER"] = "second_striker";
    Position["CENTER_FORWARD"] = "center_forward";
    Position["LEFT_FORWARD"] = "left_forward";
    Position["RIGHT_FORWARD"] = "right_forward";
    // Substitutes
    Position["SUBSTITUTE"] = "substitute";
})(Position || (Position = {}));
export var LayoutType;
(function (LayoutType) {
    LayoutType["FULL_PITCH"] = "full_pitch";
    LayoutType["HALF_PITCH"] = "half_pitch";
    LayoutType["SPLIT_PITCH"] = "split_pitch";
})(LayoutType || (LayoutType = {}));
export var SubstitutesPosition;
(function (SubstitutesPosition) {
    SubstitutesPosition["LEFT"] = "left";
    SubstitutesPosition["BOTTOM"] = "bottom";
    SubstitutesPosition["RIGHT"] = "right";
})(SubstitutesPosition || (SubstitutesPosition = {}));
