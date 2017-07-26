(function(){
//-----------------------------------------------------------------------------------
"use strict()"; 
//-------------------------------------------------------------------------------
const proxy="https://cors-anywhere.herokuapp.com/";
const endpoint="https://mobileapi.wp.pl/v1/graphql";
//-----------------------------------------------------------------------------------
let articles=[];
let cur_art_index=-1;
//-----------------------------------------------------------------------------------
window.addEventListener("load",load());
window.addEventListener("online",function(){
  document.querySelector(".offline-ind").innerHTML="";
  // display images in case they were not available
  const title_selected=document.querySelector(".titles-div__li_selected");
  if(title_selected)
      title_selected.click();
  // update current service articles
  const current_service=document.querySelector(".titles-div__headers-select").value;
  get_articles_online(current_service,false);
});
window.addEventListener("offline",function(){document.querySelector(".offline-ind").innerHTML="offline";});
document.querySelector(".titles-div__titles-ul").onclick=title_click_handler;
document.querySelector(".titles-div__headers-select").onchange=service_change_handler;
//-----------------------------------------------------------------------------------
function load(){	
  if(navigator.onLine)
  {  
    get_articles_online("Wiadomosci",true);
    get_articles_online("Gwiazdy",false);
    get_articles_online("Tech",false);
    document.querySelector(".offline-ind").innerHTML="";
  }  
  else
  {  
    display_articles_titles("Wiadomosci");
    document.querySelector(".offline-ind").innerHTML="offline";
  }  
}
//-----------------------------------------------------------------------------------
function get_articles_online(service,display_titles){
  const query_articles=`?query={articles(service:${service},t:Article){title ts body {t data} img {url author}}}&raw`;
  const xhr=new XMLHttpRequest(); 
  xhr.open("GET",proxy+endpoint+query_articles,true); 
  xhr.send(); 
  xhr.onload=function()
  {
      const articles_tmp= JSON.parse(xhr.responseText).data.articles;
      // remove duplicates
      const unique_articles = articles_tmp.filter(function(item, index, array){
        if(index==0)
            return true;
        else 
            return (array[index].title!=array[index-1].title);  
      });
      localStorage.setItem(service,JSON.stringify(unique_articles)); //for offline
      if(display_titles)
          display_articles_titles(service);
  };
}
//-----------------------------------------------------------------------------------
function display_articles_titles(service){
  articles = JSON.parse(localStorage.getItem(service)) || [];
  if(articles.length)
  {  
      let list_of_articles="";
      let i=-1;
      for(const article of articles)
         list_of_articles+=`<li class="titles-div__li" data-i=${++i}>${article.title}</li>`;
      document.querySelector(".titles-div__titles-ul").innerHTML=list_of_articles;
      document.querySelector(".titles-div__container").scrollTop=0; 
  }    
}
//-----------------------------------------------------------------------------------
function service_change_handler(event){
  document.querySelector(".titles-div__titles-ul").innerHTML="";
  document.querySelector(".content__title").innerHTML="";
  document.querySelector(".content__date-time").innerHTML="";  
  document.querySelector(".content__body").innerHTML="";
  document.querySelector(".main-img").classList.add("main-img_hidden");
  const service=event.target.value;
  if(navigator.onLine)
      get_articles_online(service,true);
  else 
      display_articles_titles(service);
}
//-----------------------------------------------------------------------------------
function get_last_modified_date_time(ts){
  const mod_date_time=new Date(ts*1000);
  const y=mod_date_time.getFullYear();
  const m=mod_date_time.getMonth()+1;
  const d=mod_date_time.getDate();
  const H=mod_date_time.getHours();
  const M=mod_date_time.getMinutes();
  let dt_string=String(y)+"-";
  if(m<10)
    dt_string+="0";
  dt_string+=String(m)+"-";
  if(d<10)
    dt_string+="0";
  dt_string+=String(d)+" &nbsp;";
  if(H<10)
    dt_string+="0";
  dt_string+=String(H)+":";
  if(M<10)
    dt_string+="0";
  dt_string+=String(M);
  return dt_string;
}
//-----------------------------------------------------------------------------------
function title_click_handler(event){
  if(!event.target.classList.contains("titles-div__li"))
      return;

  let title_selected=document.querySelector(".titles-div__li_selected");
  if(title_selected)
    title_selected.className="titles-div__li";
  event.target.classList.add("titles-div__li_selected");

  cur_art_index=parseInt(event.target.getAttribute("data-i"));
  document.querySelector(".main-img__photo").alt=event.target.innerHTML; 
  document.querySelector(".main-img__photo").src=articles[cur_art_index].img.url;
  if(navigator.onLine)   
      document.querySelector(".main-img__photo").title=event.target.innerHTML;    
  else
      document.querySelector(".main-img__photo").title="";    
    
  document.querySelector(".main-img__author").innerHTML=articles[cur_art_index].img.author;
  document.querySelector(".main-img").className="main-img";

  document.querySelector(".content__title").innerHTML=event.target.innerHTML;
  document.querySelector(".content__date-time").innerHTML=get_last_modified_date_time(articles[cur_art_index].ts);
  let content="";
  for(const par of articles[cur_art_index].body)
      content+=par.data;
  document.querySelector(".content__body").innerHTML=content;
  document.querySelector(".content").scrollTop=0; 
}
//-----------------------------------------------------------------------------------
}());
