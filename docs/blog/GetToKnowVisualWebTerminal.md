# Visual Web Terminal - A Turbocharged Command Line for Kubernetes and OpenShift

Do you ever get tired of typing `kubectl` and `oc` commands? Tired of cutting and pasting pieces of output to create new `kubectl` and `oc` commands? If you answered yes, take a look at the Visual Web Terminal, included as part of the Red Hat Advanced Cluster Management for Kubernetes console.

Take a look at the following sections to learn more:

* [What is Visual Web Terminal?](#what)
* [Getting started with the Visual Web Terminal](#get-started)
* [The basic components](#basics)
* [Advanced features](#advanced)
* [Dark mode](#darkmode)
* [What is next?](#next)


## What is Visual Web Terminal?
{:#what}

The Visual Web Terminal is a command line function with a graphical presentation.

The Visual Web Terminal, located in the product console, is an interface that combines the convenience of a graphical user interface with the speed of a command-line interface. After running a command, the data is returned in an interactive table format that can display more detail about an item when you select that item in the table.

In addition to clicking the interactive data, additional options are provided to complete the following tasks

- View logs
- View and edit YAML
- Search with embedded capability - using Red Hat Advanced Cluster Management for Kubernetes `search` engine  

In addition to commands that are specific to the Visual Web Terminal, and selected `bash` commands, the following commands are also supported:

- `kubectl` commands
- `oc` commands
- `search` commands
- `helm` commands


## Getting started with the Visual Web Terminal
{#get-started}

Access the Visual Web Terminal by using the Visual Web Terminal icon in the header of the Red Hat Advanced Cluster Management for Kubernetes page. The icon looks like a tiny terminal window with a `>` command prompt. Click this icon, select `Open in new browser tab` (best practice) and you are on your way.

![Launch diagram](images/VisualWebTerminalLaunch.gif)

Now that you have the Visual Web Terminal started, wait a few seconds for it to `oc login` to your hub cluster. No need to worry downloading and setting up the various command line tools such as `kubectl` or `oc`.  Don't worry about  KUBECONFIG. It is all taken care of for you!  You'll receive a **Visual Web Terminal is ready** message when the login and setup is complete.

## The basic components
{:#basics}

Now that you have the Visual Web Terminal started

![Basics diagram](images/VisualWebTerminalBasics.png)

### Tabs (1)  
Initially you will have one tab, Tab 1, which equates to a single terminal window. If you wish to have an additional tab, click the plus sign.

### Output Area (2) (Turbocharger)
Your output will be displayed here. Move your mouse pointer over the output to reveal links within the output that are clickable.  When you click one of these links, an additional command will be run.  This is where the turbocharging occurs.  Simply point and click and additional commands are run.  No typing, no cutting and pasting.  

Depending on the command you entered, the output area may be split to contain a left pane and a right pane. The left pane will contain the tabulated standard output. The right pane will contain a more graphical view of the resources data.

### Command Input Area (3)
Type your commands here. Use the up arrow and down arrow to review history and rerun a command. Typing `history` will bring up a list in the output area that you can click on to rerun the command.

Too much clutter from all those old commands you ran? Would you like to clean up the output area? Type `clear`

### kubectl context (4)
The Kubernetes current context (`kubectl config current-context`). To modify, you can click on this field, view the current choices in the output area and select the choice you want.

### kubectl namespace/oc project (5)
Your default `kubectl` namespace / `oc` project. To modify you can click on this field, view the current choices in the output area and select the choice you want.  

### Settings/help/getting started (6)
Bring up the *Settings*, *Help* and *Getting Started* documentation

## Advanced features
{:#advanced}

### Search across your managed clusters
No need to `oc` login to your various managed clusters to get basic information.  The `search` option available in Red Hat Advanced Cluster Management for Kubernetes is accessible from Visual Web Terminal.  Start by typing `search` and you are prompted with additional filters that can be applied to the search.

- Simple query to find all nodes on hub cluster and all managed clusters - `search kind:node`
- List saved searches - `savedsearches`

### Debugging a Pod

![Pod debug diagram](images/VisualWebTerminalPodDebug.png)

Find the pod you want to debug
- `oc get pods`
- click on the pod you wish to debug
Use the right pane in the output area to perform various tasks
  - summary  - a quick high level view of the pod
  - events - look at evenets on the pod
  - logs - See what's in the logs.  For pods with multiple containers, use the overflow menu icon (three dots stacked vertically, on the right side of the logs view) to select the specific container
  - terminal - quickly SSH into the pod to perform additional debug  
  - yaml - quickly see what's in the yaml and make changes, if required

## Dark mode
{:#darkmode}

Prefer dark mode? If so you can change the *theme* in one of two ways:
1. Type `theme`, then select `Carbon Gray90` theme
2. Select the `Settings` icon in the lower right, then select `theme`, then select `Carbon Gray90`.

## What is next?
{:#next}

If you need additional information about Visual Web Terminal, please check the Red Hat Advanced Cluster Management for Kubernetes documentation at https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/2.0/html/web_console/web-console#visual-web-terminal.

We hope you have found a new productivity tool for doing future `kubectl`,  `oc` and `search` commands. We are interested in your feedback and experiences. Contact us about using the Visual Web Terminal by contacting us at TODO  
