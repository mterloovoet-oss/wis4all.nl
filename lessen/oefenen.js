"use strict";
const random = (min,max) => min + Math.floor(Math.random() * (max-min+1));
function makeQuestion(topic, hard) {
 const a = random(2, hard ? 25 : 10);
 const b = random(2, hard ? 18 : 9);
 switch(topic) {
 case 0: return hard ? ["−"+a+" − (−"+b+") = ?",b-a,String(b-a)] : ["−"+a+" + "+b+" = ?",b-a,String(b-a)];
 case 1: {
   const d = hard ? random(3,10) : random(3,8);
   const n = random(1,d-1);
   return hard ? [n+"/"+d+" + 1/"+(2*d)+" = ?",(2*n+1)/(2*d),(2*n+1)+"/"+(2*d)] : ["1/"+d+" + "+n+"/"+d+" = ?",(1+n)/d,(1+n)+"/"+d];
 }
 case 2: {
   const pct = (hard ? random(3,19) : random(1,9)) * (hard ? 5 : 10);
   const base = a * (hard ? 12 : 10);
   const value = base*pct/100;
   return [pct+"% van "+base+" = ?",value,String(value).replace(".",",")];
 }
 default: {
   const value = hard ? -a : a;
   const factor = hard ? b : 2;
   return [factor+"x + "+b+" = "+(factor*value+b)+". Wat is x?",value,String(value)];
 }
 }
}
function parseAnswer(raw) {
 const parts = raw.trim().replaceAll("−","-").replaceAll(",",".").split("/").map(part => part.trim());
 if (parts.length>2 || !parts.every(part => /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(part))) return NaN;
 return parts.length===1 ? Number(parts[0]) : Number(parts[0])/Number(parts[1]);
}

const topic = Number(document.body.dataset.topic);
const get = id => document.getElementById(id);
let current;
let submitted = false;
let questions = 0;
let correct = 0;
let goal = false;
function displayScore(){
 get("progress").value = correct;
 get("score").textContent = correct+" goed van "+questions+" geprobeerd · doel: 5 goed";
}
function nextQuestion(){
 const previous = current?.[0];
 current = makeQuestion(topic, get("skill").selectedIndex === 1);
 for(let tries=0; current[0]===previous && tries<5; tries++){
   current = makeQuestion(topic, get("skill").selectedIndex === 1);
 }
 submitted = false;
 get("question").textContent = current[0];
 get("answer").value = "";
 get("feedback").textContent = "";
 get("check").formNoValidate = false;
 get("check").textContent = "Controleer";
 get("hint").open = false;
 get("hint-text").textContent = get("skill").selectedOptions[0].dataset.hint;
}
function startSkill(){
 questions = correct = 0;
 goal = false;
 displayScore();
 nextQuestion();
}
get("skill").onchange = startSkill;
for(const link of document.querySelectorAll("[data-skill]")){
 link.onclick = () => {
   const index = Number(link.dataset.skill);
   if(get("skill").selectedIndex!==index){
     get("skill").selectedIndex=index;
     startSkill();
   }
   get("practice-heading").focus({preventScroll:true});
 };
}
get("exercise-form").onsubmit = event => {
 event.preventDefault();
 if(submitted) {nextQuestion();get("answer").focus();return;}
 const entered = parseAnswer(get("answer").value);
 if(!Number.isFinite(entered)){
   get("feedback").textContent = "Vul een getal of een breuk in, bijvoorbeeld 0,5 of 1/2.";
   return;
 }
 const right = Math.abs(entered-current[1])<1e-8;
 questions++;
 if(right) correct++;
 const reached = correct===5 && !goal;
 if(reached) goal=true;
 get("feedback").textContent = reached ? "Je hebt je doel gehaald: vijf goede antwoorden!" : right ? "Helemaal goed!" : "Het juiste antwoord is "+current[2]+".";
 displayScore();
 submitted = true;
 get("check").formNoValidate = true;
 get("check").textContent = "Volgende opgave";
};
startSkill();
