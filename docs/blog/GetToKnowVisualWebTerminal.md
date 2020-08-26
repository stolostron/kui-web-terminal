# Visual Web Terminal - A Turbocharged Command Line for Kubernetes and OpenShift

Do you ever get tired of typing `kubectl` and `oc` commands? Tired of cutting and pasting pieces of output to create new `kubectl` and `oc` commands?  If you answered yes, take a look at Visual Web Terminal, which is included as part of Red Hat Advanced Cluster Management.

## Command line function with a graphical presentation


The Visual Web Terminal is an interface that combines the convenience of a graphical user interface with the speed of a command-line interface. After running a command, the data is returned in an interactive table format that can display more detail about an item when you select that item in the table.

In addition to being able to click the interactive data, additional options are provided to:

- view logs
- view and edit YAML
- Embedded search capability - using Red Hat Advanced Cluster Management `search` engine  

The Visual Web Terminal is an interface that combines the convenience of a graphical user interface with the speed of a command-line interface. After running a command, the data is returned in an interactive table format that can display more detail about an item when you select that item in the table.

In addition to commands that are specific to the Visual Web Terminal, the following commands are also supported:

- Selected basic bash commands
- `helm` commands
- `kubectl` commands
- `oc` commands
- `search` commands

## How do I start using it?
Visual Web Terminal is not found in the navigation menu, it is accessed by using the icon at the top right of the Red Hat Advanced Cluster Management page.   The icon looks like a tiny terminal window with a `>` command prompt.   Click this icon, select `Open in new browser tab` and you are on your way.

![Launch diagram](images/VisualWebTerminalLaunch.gif)

## The basics

![Basics diagram](images/VisualWebTerminalBasics.jpg)
### Tabs (1)  
Initially you will have one tab, Tab 1, which equates to a single terminal window.  If you wish to have an additional tab, click the plus sign.

### Output Area (2)
Output will be displayed here.
Depending on the command you entered, the output area may be split to contain a left pane and a right pane.  The left pane will contain the tabulated standard output.  The right pane will contain a more graphical view of the resources data.

### Command Input Area (3)
Type your commands here.  Up arrow and down arrow to review history and rerun a command.  Typing `history` will bring up a list in the output area that you can click on to rerun the command.

### kubectl context (4)
The kubernetes current context (`kubectl config current-context`).  To modify you can click on this field, view the current choices in the output area and select the choice you want.

### kubectl namespace/ oc project (5)
Your default `kubectl` namespace / `oc` project.  To modify you can click on this field, view the current choices in the output area and select the choice you want.  

### Help/getting started (6)
Bring up the *Help* and *Getting Started* documentation

## Advanced features

### Search across your managed clusters
No need to `oc` login to your various managed clusters to get basic information.  The `search` option available in Red Hat Advanced Cluster Management is accessible from Visual Web Terminal.  Start by typing `search` and you are prompted with additional filters that can be applied to the search.

### Debugging Pods
- find pod
- right pane - use various tabs
  - summary  - a quick high level view of the pod
  - events -
  - logs - See what's in the logs.  For pods with multiple containers, use the three-dot menu on the right side of the logs view to select the specific container
  - terminal - quickly SSH into the pod to perform additional debug  
  - yaml - quickly see what's in the yaml and possibly make changes 

## Summary
We hope you have found a new productivity tool for doing future `kubectl`,  `oc` and `search` commands.

Tell us about your experiences using Visual Web Terminal by contacting us at TODO  
