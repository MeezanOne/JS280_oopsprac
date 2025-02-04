class DOMHelper {

    static clearEventListeners(element){
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement
    }

    static moveElement(elementId, newDestinationSelector){
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element)
    }
}

class Component{
    constructor(hostElementId, insertBefore = false){
        if(hostElementId){
            this.hostElement = document.getElementById(hostElementId);
        } else{
            this.hostElement = document.body;
        }
        this.insertBefore = insertBefore
    }
    detach () {
        this.element.remove();
        // this.element.parentElement.removeChild(this.element);
    }

    attach(){
        // console.log('The ToolTip...');
        // document.body.append(this.element);
        this.hostElement.insertAdjacentElement(this.insertBefore?'afterbegin':'beforeend', this.element);
    }
}


class Tooltip extends Component{
    constructor(closeNotifierFunction){
        super('active-projects', true)
        this.closeNotifier = closeNotifierFunction;
        this.create();
    }
    closeTooltip = () => {
        this.detach();
        this.closeNotifier();
    }
    create(){
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';
        tooltipElement.textContent = "DUMMY";
        tooltipElement.addEventListener('click', this.closeTooltip);
        this.element = tooltipElement
    }

}

class ProjectItem {
    hasActiveTooltip = false;

    constructor(id, updateProjectListsFunction,type){
        this.id = id;
        console.log(id, type)
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton(type);
    }

    showMoreInfoHandler(){
        if(this.hasActiveTooltip){
            return;
        }
        const tooltip = new Tooltip(()=>{
            this.hasActiveTooltip = false;
        }); 
        tooltip.attach();
        this.hasActiveTooltip = true;
    }
 
    connectMoreInfoButton(){
        const projectItemElement = document.getElementById(this.id);
        const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click', this.showMoreInfoHandler);
    }

    connectSwitchButton(type){
        const projectItemElement = document.getElementById(this.id);
        let switchBtn = projectItemElement.querySelector('button:last-of-type');
        switchBtn.textContent = type === 'active'? 'Finsh':'Activate';
        switchBtn = DOMHelper.clearEventListeners(switchBtn)
        switchBtn.addEventListener('click', this.updateProjectListsHandler.bind(null, this.id));
    }

    update(updateProjectListsFn, type){
        this.updateProjectListsHandler = updateProjectListsFn;
        this.connectSwitchButton(type);
    }
}

class ProjectList{
    projects = [];
    constructor(type){
        this.type = type;
        const prjItems = document.querySelectorAll(`#${type}-projects li`);
        for(const prjItem of prjItems) {
            this.projects.push(
                new ProjectItem(prjItem.id, this.switchProject.bind(this),this.type)
            )
        }
        console.log(this.projects);
    }

    setSwitchHandlerFunction(switchHandlerFunction){
        this.switchHandler = switchHandlerFunction;
    }

    addProject(project){
        console.log(project)
        this.projects.push(project);
        DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this), this.type);
    }

    switchProject(projectId){
        // const projectIndex = this.projects.findIndex(p => p.id === projectId);
        // this.projects.splice(projectIndex, 1);
        // console.log(projectId)
        this.switchHandler(this.projects.find(p => p.id === projectId));
        this.projects = this.projects.filter(p => p.id !== projectId); 
    }
}

class App {
    static init(){
        const activeProjectsList = new ProjectList('active');
        const finishedProjectsList = new ProjectList('finished');
        activeProjectsList.setSwitchHandlerFunction(finishedProjectsList.addProject.bind(finishedProjectsList));

        finishedProjectsList.setSwitchHandlerFunction(activeProjectsList.addProject.bind(activeProjectsList));
    }
}

App.init();



// 1️⃣ DOMHelper Class
// clearEventListeners(element): Creates a deep clone of the element (removes old event listeners) and replaces it.
// moveElement(elementId, newDestinationSelector): Moves an element from one place to another in the DOM.


// 2️⃣ Component Class
// This is a Base Class that:
// Accepts an element where the component should be attached.
// detach(): Removes the element from the DOM.
// attach(): Inserts the element at the correct position.


// 3️⃣ Tooltip Class (Extends Component)
// Shows a tooltip when clicking "More Info".
// Calls closeNotifierFunction when clicked to close itself.


// 4️⃣ ProjectItem Class
// Handles individual projects inside a list.
// Stores id, sets up event listeners, and controls buttons.
// Methods:
// showMoreInfoHandler(): Creates and attaches a Tooltip when clicking "More Info".
// connectMoreInfoButton(): Adds a click listener to the "More Info" button.
// connectSwitchButton(type): Adds event listeners to the "Finish/Activate" button.
// update(updateProjectListsFn, type): Updates the project when moved between lists.


// 5️⃣ ProjectList Class
// Manages lists of projects in Active or Finished categories.
// Methods:
// setSwitchHandlerFunction(fn): Sets a function for handling project switching.
// addProject(project): Moves a project to the correct list.
// switchProject(projectId): Calls the switch handler and removes the project from the old list.


// 6️⃣ App Class (Entry Point)
// Initializes two ProjectList instances (active and finished).
// Sets up event listeners to move projects between lists using .bind().

// Your project follows OOP principles effectively. The key takeaways: 
// ✅ Encapsulation: Classes handle their own logic.
// ✅ Reusability: Component is extendable (used by Tooltip).
// ✅ Event Handling: .bind() ensures correct this context.
// ✅ Separation of Concerns: Different classes for UI, logic, and helpers.