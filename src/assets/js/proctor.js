export function proctor(options) {
  _proctor = options;
  function loadJS(src, onload) {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = src;
    ga.onload = onload;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);s
  }

  _proctor.user_info = {
    "Assessment Taker's Name": options.user.name,
    "Email ID": options.user.email,
    "Tool Name": options.tool_name
  };
  _proctor.s3_folder = options.s3_folder + "/user_assessments/"+options.id;
  _proctor.photo_interval = 60*1000;

  loadJS(options.host + '/proctor/proctor.js', function(){
    console.log("Proctoring Started");
  });
};
