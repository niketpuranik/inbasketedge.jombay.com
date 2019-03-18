export const IMAGE_BASE_URL = "https://apiproduction.s3.amazonaws.com/simulation/inbasketlite";
export const READ_EMAILS_IDENTIFIER = "read_email";
export const SIMULATION_STATUSES = {
  'ready_for_scoring': 'ready_for_scoring',
  'sent': 'sent',
  'started': 'started'
}
export const EMAIL_ACTIVITY_GROUP_IDENTIFIERS = {
  "assign_email":"assign_email",
  "assign_priority":"assign_priority",
  "reply":"reply",
  "mark_for_future":"mark_for_future",
  "read_email": "read_email",
  "long_reply":"long_reply"
}
export const PERSON_ACTIVITY_GROUP_IDENTIFIERS = ["person_actions"];
export const PERSON_STATUS = {
  "emplayee": "emplayee",
  "candidate": "candidate"
};

export const EMAIL_ACTIVITY_IDENTIFIERS = {
  "clear_selection": "clear_selection",
  "seek_help_from": "self",
  "mark_for_future":"mark_for_future"
};

export const EMAIL_OPTION_IDENTIFIERS = {
  "clear_selection": "clear_selection"
};
export const EMAIL_POSITIONS = {
  "bottom": "bottom",
  "right_panel": "right_panel"
};
export let SIMULATION: any;
export let CURRENT_USER: any;
export let CURRENT_SIMULATION_USER: any;
export let EMAILS = [];
export let PERSONS = [];
export let ACTIVITY_GROUPS = [];
export let ACTIVITIES = [];
export let USER_COMPANY_SIMULATION: any;
export let BASE_URL = "";

export let EMAIL_ACTIVITIES = [];
export let READ_EMAIL_IDS = [];
export let PERSON_ACTIVITIES = [];
export let USER_TRAININGS = [];
export let USER_TEAMS = [];
export let USER_PERFORMANCE_RECOMMENDATIONS = [];
export let USER_BUDGETS = [];
export let USER_EVENTS = [];
export let NO_OF_TEAM_MEMBERS: any;

export let AUTH_TOKEN = "";

export let UNSAVED_BUDGET_ALLOCATIONS = [];
export let MARK_FOR_FUTURE_EMAIL_IDS = [];
export let NOTIFICATIONS = [];
export let EMAIL_PRIORITY: any = {};
export let EMAIL_QUESTION_RESPONSES = [];

export let S3_ASSET_FOLDER: string = "v1";

export let DAY_COUNT: any = 1;

export function setDayCount(count) {
  DAY_COUNT = count;
}

export function setEmailQuestionResponses(email_question_responses) {
  EMAIL_QUESTION_RESPONSES = email_question_responses || [];
}

export function addEmailQuestionResponses(email_question_response) {
  EMAIL_QUESTION_RESPONSES.push(email_question_response);
}

export function setNotifications(notifications) {
  NOTIFICATIONS = notifications;
}

export function addUnsavedBudgetAllocation(value, budget_group, item) {
  UNSAVED_BUDGET_ALLOCATIONS.push({
    value: value,
    budget_group_id: budget_group._id.$oid,
    item_id: item._id.$oid,
    identifier: item.identifier
  });
}

export function clearUnsavedBudgetAllocation() {
  UNSAVED_BUDGET_ALLOCATIONS = [];
}

export function setAuthToken(token) {
  AUTH_TOKEN = token;
}

export function setUserEvents(user_events) {
  USER_EVENTS = user_events || [];
}

export function addUserEvent(user_events) {
  USER_EVENTS.push(user_events);
}

export function setUserTrainings(user_training) {
  USER_TRAININGS = user_training || [];
}

export function addUserTraining(user_training) {
  USER_TRAININGS.push(user_training);
}

export function setUserTeams(user_teams) {
  USER_TEAMS = user_teams || [];
}

export function addUserTeam(user_team) {
  USER_TEAMS.push(user_team);
}

export function setUserPerformanceRecommendations(user_performance_recommendations) {
  USER_PERFORMANCE_RECOMMENDATIONS = user_performance_recommendations || [];
}

export function addUserPerformanceRecommendation(user_performance_recommendation) {
  USER_PERFORMANCE_RECOMMENDATIONS.push(user_performance_recommendation);
}

export function setUserBudgets(user_budgets) {
  USER_BUDGETS = user_budgets || [];
}

export function addUserBudget(user_budget) {
  USER_BUDGETS.push(user_budget);
}

export function setPersonActivities(person_activities) {
  PERSON_ACTIVITIES = person_activities || [];
}
export function addPersonActivity(person_activity) {
  PERSON_ACTIVITIES.push(person_activity);
}

export function setEmailActivities(email_activities) {
  EMAIL_ACTIVITIES = email_activities || [];
  setReadEmails();
  setMarkForFutureEmails();
  setEmailPriority();
}

export function setEmailPriority() {
  var assign_priority_activity_group = ACTIVITY_GROUPS.find(ag => ag.identifier == EMAIL_ACTIVITY_GROUP_IDENTIFIERS['assign_priority']);
  var assign_email_activities = EMAIL_ACTIVITIES.filter(ea =>
    ea.activity_group_id.$oid == assign_priority_activity_group._id.$oid);
  for(var assign_email_activity of assign_email_activities) {
    var activity = ACTIVITIES.find(a => a._id.$oid == assign_email_activity.activity_id.$oid);
    EMAIL_PRIORITY[assign_email_activity.email_id.$oid] = activity;
  }
}

export function addEmailPriority(assign_email_activity) {
  var activity = ACTIVITIES.find(a => a._id.$oid == assign_email_activity.activity_id.$oid);
  EMAIL_PRIORITY[assign_email_activity.email_id.$oid] = activity;
}

export function setReadEmails() {
  var read_email_activity = ACTIVITIES.find(a => a.identifier === READ_EMAILS_IDENTIFIER);
  var read_email_activities = EMAIL_ACTIVITIES.filter(ea => ea.activity_id.$oid === read_email_activity._id.$oid);
  READ_EMAIL_IDS =  read_email_activities.map(function(ea) {
    return ea.email_id.$oid
  });
}

export function addEmailActivity(email_activity) {
  EMAIL_ACTIVITIES.push(email_activity);
}

export function addReadEmailId(read_email_id) {
  READ_EMAIL_IDS.push(read_email_id);
}

export function setMarkForFutureEmails() {
  var mark_for_future_email_activity = ACTIVITIES.find(a => a.identifier === EMAIL_ACTIVITY_IDENTIFIERS["mark_for_future"]);
  var mark_for_future_email_activities = EMAIL_ACTIVITIES.filter(ea => ea.activity_id.$oid === mark_for_future_email_activity._id.$oid);
  for( let mark_for_future_email_activity of mark_for_future_email_activities) {
    addMarkForFutureEmailId(mark_for_future_email_activity.email_id.$oid);
  }
}

export function addMarkForFutureEmailId(mark_for_future_email_id) {
  var index = MARK_FOR_FUTURE_EMAIL_IDS.indexOf(mark_for_future_email_id);
  if(index > -1) {
    MARK_FOR_FUTURE_EMAIL_IDS.splice(index, 1);
  } else {
    MARK_FOR_FUTURE_EMAIL_IDS.push(mark_for_future_email_id);
  }
}

export function setSimulation(simulation) {
  SIMULATION = simulation;
  if(SIMULATION.s3_asset_folder) {
    S3_ASSET_FOLDER = SIMULATION.s3_asset_folder
  }
}

export function setCurrentUser(user) {
  CURRENT_USER = user;
}

export function setEmails(emails) {
  EMAILS = emails;
}

export function setPersons(persons) {
  PERSONS = persons;
  CURRENT_SIMULATION_USER = persons.find(p => p.is_player);
  NO_OF_TEAM_MEMBERS = PERSONS.filter(p => (p.status === "employee") && (p.manager_ids.some( m_id => m_id.$oid === CURRENT_SIMULATION_USER._id.$oid))).length;
}

export function setActivityGroups(activity_groups) {
  ACTIVITY_GROUPS = activity_groups;
}

export function setActivities(activities) {
  ACTIVITIES = activities;
}

export function setUserCompanySimulation(user_company_simulation) {
  USER_COMPANY_SIMULATION = user_company_simulation;
}
export function setBaseUrl(url) {
  BASE_URL = "/inbasket_edge/"+url;
}

function unique(data) {
  return data = data.filter((item, index, self) => self.findIndex((t) => {return t._id.$id === item._id.$id }) === index)
}
