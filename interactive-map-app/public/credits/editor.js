'use strict';
const form = document.querySelector('#form');
const statusLine = document.querySelector('#status');
let draft;
const newField = text => ({text});
const pageGroups = [
  ['Opening', {eyebrow:'Eyebrow',title:'Main title',intro:'Introduction',follow:'Scroll link'}],
  ['Final section', {endingLabel:'Eyebrow',endingTitle:'Title, first line',endingEm:'Title, second line',thanks:'Thank-you message',back:'Return link',footerLeft:'Footer, left',footerRight:'Footer, right'}],
  ['Page controls', {pageTitle:'Browser tab title',skip:'Skip link',pause:'Pause button',resume:'Resume button',reduced:'Reduced-motion button'}]
];
function element(tag, text) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  return el;
}
function button(label, action) {
  const el = element('button',label);
  el.onclick = action;
  return el;
}
function save() {
  try {
    localStorage.setItem(Credits.key,JSON.stringify(draft));
    statusLine.textContent = 'Draft saved in this browser.';
    return true;
  } catch {
    statusLine.textContent = 'Browser storage is unavailable or full. Export your draft to keep it.';
    return false;
  }
}
function fieldBox(label, field, onText) {
  const box = element('fieldset');
  const input = element('textarea');
  input.rows = 2; input.value = field.text; input.setAttribute('aria-label',label);
  input.oninput = () => {field.text=input.value; onText?.(); save();};
  box.append(element('legend',label),input);
  if (field === draft.page.pageTitle) return box;
  const bar = element('div'); bar.className='format';
  const size = element('input'); size.type='number'; size.min='1'; size.step='any'; size.placeholder='Auto';
  size.value=field.size ?? '';
  size.oninput=()=>{
    if (!size.validity.valid) return;
    if (size.value==='') delete field.size; else field.size=size.valueAsNumber;
    save();
  };
  const sizeLabel=element('label','Size (px) '); sizeLabel.append(size); bar.append(sizeLabel);
  for(const prop of ['bold','italic']){
    const labelEl=element('label',prop==='bold'?'Bold ':'Italic ');
    const select=element('select');
    for(const [value,text] of [['','Default'],['true','On'],['false','Off']]) select.add(new Option(text,value));
    select.value=field[prop] == null ? '' : String(field[prop]);
    select.onchange=()=>{if(select.value==='')delete field[prop];else field[prop]=select.value==='true';save();};
    labelEl.append(select);bar.append(labelEl);
  }
  box.append(bar);return box;
}
function panel(label) {
  const el=element('details');el.append(element('summary',label));return el;
}
function personBox(section,person) {
  const box=panel(person.name.text || 'Contributor');
  box.append(fieldBox('Role',person.role),fieldBox('Name',person.name,()=>box.firstChild.textContent=person.name.text || 'Contributor'));
  box.append(button('Remove contributor',()=>{
    if(!confirm('Remove this contributor?'))return;
    section.people.splice(section.people.indexOf(person),1);box.remove();save();
  }));return box;
}
function sectionBox(section) {
  const box=panel(section.title.text || 'Untitled section');
  box.append(fieldBox('Section label',section.label),fieldBox('Section title',section.title,()=>box.firstChild.textContent=section.title.text || 'Untitled section'),fieldBox('Caption',section.note));
  const people=element('div');
  for(const person of section.people) people.append(personBox(section,person));
  const tools=element('div');tools.className='tools';
  tools.append(button('Add contributor',()=>{
    const person={role:newField(''),name:newField('')};section.people.push(person);
    const added=personBox(section,person);people.append(added);added.open=true;added.querySelector('textarea').focus();save();
  }),button('Remove section',()=>{
    if(draft.sections.length===1){statusLine.textContent='Keep one credits section for the seagull.';return;}
    if(!confirm('Remove this section and its contributors?'))return;
    draft.sections.splice(draft.sections.indexOf(section),1);box.remove();save();
  }));
  box.append(element('h3','Contributors'),people,tools);return box;
}
function render() {
  form.replaceChildren();
  for(const [title,fields] of pageGroups){
    const group=panel(title);
    for(const [key,label] of Object.entries(fields)) group.append(fieldBox(label,draft.page[key]));
    form.append(group);
  }
  const gull=panel('Seagull dialogue');
  draft.gullLines.forEach((f,i)=>gull.append(fieldBox('Line '+(i+1),f)));form.append(gull);
  form.append(element('h2','Credit sections'));
  const list=element('div');draft.sections.forEach(s=>list.append(sectionBox(s)));
  form.append(list,button('Add section',()=>{
    const section={label:newField(String(draft.sections.length+1).padStart(2,'0')+' / Credits'),title:newField('New section'),note:newField(''),people:[]};
    draft.sections.push(section);
    const box=sectionBox(section);list.append(box);box.open=true;box.querySelector('textarea').focus();save();
  }));
}
const projectButton = document.querySelector('#project');
if ('showOpenFilePicker' in window) projectButton.hidden = false;
projectButton.onclick = async () => {
  if (!draft) return;
  try {
    const [file] = await window.showOpenFilePicker({
      types:[{description:'Project credits',accept:{'application/json':['.json']}}]
    });
    if (file.name !== 'credits.json') throw new Error('Choose public/credits/credits.json in the project.');
    Credits.validate(JSON.parse(await (await file.getFile()).text()));
    if (!confirm('Replace the selected project credits file with this draft?')) return;
    const writer = await file.createWritable();
    await writer.write(JSON.stringify(draft,null,2)+'\n');
    await writer.close();
    statusLine.textContent = 'Project file saved. Reload the credits page to see the changes locally.';
  } catch (error) {
    if (error.name !== 'AbortError') statusLine.textContent = 'Could not save to the project. Use Export credits.json. ' + error.message;
  }
};
document.querySelector('#export').onclick=()=>{
  if(!draft)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)+'\n'],{type:'application/json'}));
  const link=element('a');link.href=url;link.download='credits.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
document.querySelector('#preview').onclick=()=>{if(draft && save())window.open('index.html?preview=1','_blank','noopener');};
document.querySelector('#import').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    const next=Credits.validate(JSON.parse(await file.text()));
    if(!draft || confirm('Replace the current draft with this file?')){draft=next;render();save();}
  }catch(error){statusLine.textContent='Import failed. '+error.message;}
  event.target.value='';
};
Credits.load(true).then(data=>{draft=data;render();statusLine.textContent='Ready to edit.';}).catch(error=>{statusLine.textContent=error.message;});
