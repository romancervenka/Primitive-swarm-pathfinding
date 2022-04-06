
let canvas = document.getElementById("canvas");
let runinng = false;
let requestAnimationID;
let foundPath;
let p, graph; 
let prevTime, fpsInterval; //animation frequency control
let fps = 15; //determines frame rate and also speed, 1 frame = 1 step of agent
window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(f){return setTimeout(f, 1000/60)};
class GraphNode {
	constructor(x, y, id){
		this.x = x;
		this.y = y;
		this.id = id;
		this.neighbors = [];
	}
}
class Edge{
	constructor(idA, idB, weight){
		if(idA == idB) return;
		if(idA > idB){  //lower value id first
			var temp = idA;
			idA = idB;
			idB = temp;
		}
		this.idA = idA;
		this.idB = idB;
		this.weight = weight;
	}
	containsNode(id){
		return (this.idA == id || this.idB == id)
	}
	getOtherNode(id){
		if(id == this.idA) return this.idB;
		else return this.idA;
	}
}

class Graph{
	constructor(){
		this.nodes = [];
		this.edges = [];
	}
	addNode(x, y){
		let temp = new GraphNode(x, y, this.nodes.length);
		this.nodes.push(temp);
	}
	getNode(id){
		for(let i of this.nodes){
			if(i.id == id)
				return i
		}
	}
	addEdge(idA, idB, weight){
		for(let i of this.edges)
			if(idA == i.idA && idB == i.idB) return;
		this.edges.push(new Edge(idA, idB, weight))
	}
	deleteNode(id){
		for(let i = 0; i < this.edges.length; i++)
			if (this.edges[i].idA == id || this.edges[i].idB == id){
				this.edges.splice(i,1);
				i--;
			}
		for(let i = 0; i < this.nodes.length; i++){
			if (this.nodes[i].id == id){
				this.nodes.splice(i, 1);
				break;
			}				
		}		
	}
	deleteEdge(idA, idB){
		for(let i = 0; i < this.edges.length; i++){
			if (this.edges[i].idA == idA && this.edges[i].idB == idB){
				this.edges.splice(i,1);
				break;
			}				
		}	
	}
	getEdges(nodeid){
		let out = [];
		for(let x of this.edges){
			if(x.containsNode(nodeid)) 
				out.push(x);
		}
		return out
	}

}

class Agent{
	constructor(startNode, endNode, graph){
		this.start = startNode;
		this.node = startNode;
		this.goal = endNode;
		this.graph = graph;
		this.edge = undefined;
		this.leftDist = 0;
		this.path = [];
	}
	step(){
		//console.log(this.node);
		//starts undefined -> assign edge from start node
		if(this.edge == undefined){
			let temp = this.graph.getEdges(this.node);
			this.edge = temp[Math.floor(Math.random() * temp.length)];
			
			this.leftDist = this.edge.weight;
			this.path.push(this.node);
		}
		else if(this.leftDist == 0){
			let exedge = this.edge;
			if(this.node == start) this.path = [];
			this.node = this.edge.getOtherNode(this.node);
			//if agent return to start, clear path of visited nodes
			this.path.push(this.node);
			let temp = this.graph.getEdges(this.node);
			temp = temp.filter(x => exedge != x);
			this.edge = temp[Math.floor(Math.random() * temp.length)];
			if(!this.edge){ 
				return false;
			}
			this.leftDist = this.edge.weight;
		}
		
		this.leftDist--;

		if(this.node == this.goal){
			runinng = false;
			return true;
		}
		return false;
	}
	getXY(){
		if(this.edge == undefined) return 0,0;
		let left = this.leftDist/this.edge.weight
		let x = (this.graph.getNode(this.node).x * left +
				 this.graph.getNode(this.edge.getOtherNode(this.node)).x * (1 - left));
		let y = (this.graph.getNode(this.node).y * left+ 
				 this.graph.getNode(this.edge.getOtherNode(this.node)).y * (1 - left)) ;
		return [x, y]
	}
}

class Path{
	constructor(startNode, endNode, graph, agentCount){
		this.agents = [];
		for(let i = 0; i < agentCount; i++)
			this.agents.push(new Agent(startNode, endNode, graph));
	}
	animate(){
		let ctx = canvas.getContext("2d");
		let found;
		ctx.fillStyle = "#0000FF"
		for(let i of this.agents){
			let temp = i.getXY();
			ctx.fillRect(temp[0], canvas.height - temp[1], 10, 10);
			found = i.step()
			if(found){
				foundPath = i.path;
				runinng = false;
				stopAnimation();
				drawFound();
				break;
			}
		}
		ctx.fillStyle = "#000000" // set to default black
	}
}
function smoothAnimation(){

	if(window.performance.now() - prevTime > fpsInterval){
		draw();
		p.animate();
		prevTime = window.performance.now();
	}
	if(runinng)
		requestAnimationID = window.requestAnimationFrame(smoothAnimation);
}
function startAnimation(){
	fpsInterval = 1000 / fps; 
	prevTime = window.performance.now();
	requestAnimationID = window.requestAnimationFrame(smoothAnimation)
}
function stopAnimation(){
	window.cancelAnimationFrame(requestAnimationID);
}

function addNode(){
	if(!graph) graph = new Graph();
	x = parseInt(document.getElementById("x").value);
	y = parseInt(document.getElementById("y").value);
	if(!x || !y)
		console.log("At least one field is empty");
	graph.addNode(x, y)
	draw();
}
function deleteNode(){
	id = parseInt(document.getElementById("id").value);
	graph.deleteNode(id);
	draw();
}
function addEdge(){
	graph.addEdge(parseInt(document.getElementById("idA").value), 
					parseInt(document.getElementById("idB").value), 
					parseInt(document.getElementById("weight").value));
	draw();
}
function deleteEdge(){
	graph.deleteEdge(parseInt(document.getElementById("idA").value), 
					parseInt(document.getElementById("idB").value));
	draw();
}


window.onload = onresize;
function onresize(){
	canvas.width = window.screen.width * 0.8;
	canvas.height = window.screen.height * 0.8;
	document.getElementById("x").max = canvas.width * 0.9;
	document.getElementById("y").max = canvas.height * 0.9;
}

function draw(){
	let ctx = canvas.getContext("2d")
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(let n of graph.nodes){
		if(n == undefined) continue;
		ctx.beginPath();
		ctx.arc(n.x, canvas.height - n.y, 20, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.font = "20px Arial";
		ctx.fillText(n.id, n.x - 5, canvas.height - n.y + 5);
	}
	for(let n of graph.edges){
		if(n == undefined) continue;
		ctx.beginPath();
		ctx.moveTo(graph.getNode(n.idA).x, canvas.height - graph.getNode(n.idA).y);
		ctx.lineTo(graph.getNode(n.idB).x, canvas.height - graph.getNode(n.idB).y);
		ctx.stroke();
		ctx.font = "20px Arial";
		ctx.fillText(n.weight, (graph.getNode(n.idA).x + graph.getNode(n.idB).x)/2,
					canvas.height -(graph.getNode(n.idA).y +  graph.getNode(n.idB).y)/2);
	}
}
function drawFound(){
	let ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#00FF00"
	for(let i of foundPath){
		ctx.beginPath();
		ctx.arc(graph.getNode(i).x, canvas.height - graph.getNode(i).y, 20, 0, 2 * Math.PI);
		ctx.stroke();
	}
	ctx.strokeStyle = "#000000";
}

function findPath(){
	let s = parseInt(document.getElementById("start").value);
	let end = parseInt(document.getElementById("end").value);
	let c = parseInt(document.getElementById("agentCount").value);
	p = new Path(s,end, graph, c);
	runinng = true;
	startAnimation();
	
}

function clear(){
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

}
function example(){
	graph = new Graph();
	clear();
	graph.addNode(50,100); //0
	graph.addNode(50,200);
	graph.addNode(150,150);
	graph.addNode(160,220);
	graph.addNode(400,350);
	graph.addNode(400,550); //5
	graph.addNode(700,300);
	graph.addNode(1200,800);
	graph.addNode(900,700);
	graph.addNode(1050,400);
	graph.addNode(1300,350); //10
	graph.addNode(800,900);
	graph.addNode(100, 920)
	graph.addEdge(0,1,5);
	graph.addEdge(0,2,6);
	graph.addEdge(1,3,3);
	graph.addEdge(2,6,4);
	graph.addEdge(5,4,9);
	graph.addEdge(3,4,10);
	graph.addEdge(6,4,5);
	graph.addEdge(5,6,7);
	graph.addEdge(3,6,10);
	graph.addEdge(8,6,3);
	graph.addEdge(7,9,6);
	graph.addEdge(8,10,11);
	graph.addEdge(5,6,7);
	graph.addEdge(8,9,5);
	graph.addEdge(7,10,8)
	graph.addEdge(7, 11, 10);
	graph.addEdge(11,12,5);
	graph.addEdge(5,11,5);
	graph.addEdge(5, 12, 6);
	graph.addEdge(6,11,5);

	draw();
}
