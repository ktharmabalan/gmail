<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">Gmail API app</a>
    </div>
  </div>
</nav>
<!-- <input type="text" placeholder="Search email">
<div class="dropdown pull-right">
  <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
    Limit
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
    <li><a href="#">5</a></li>
    <li><a href="#">10</a></li>
    <li><a href="#">20</a></li>
  </ul>
</div> -->
<div ng-controller="labelsController">
  <ul class="nav nav-pills">
    <li role="presentation" ng-repeat="label in topLabels" ng-click="setSelectedLabel(label)" class="col-md-2" ng-class="{'active': isLabelSelected(label)}"><a href="#{{ label.value }}" data-toggle="tab">{{ label.value }}</a></li>
  </ul>
</div>
<div class="clearfix email-container" ng-controller="threadsController">
  <div class="col-md-1 label-container">
    <ul ng-repeat="label in labels">
      <li>{{ label.name }}</li>
    </ul>
  </div>

    <div class="col-md-3 message-item-container">
    <div ng-repeat="thread in threads" ng-click="setSelectedThread(thread)" ng-show="thread.messages[0].labelIds.indexOf(getSelectedLabel()) != -1" class="message-item" ng-class="{'selected-message-item': isThreadSelected(thread)}">
      <div class="row">
        <div class="col-md-8">
            <p>{{ thread.messages[0].payload.headers['From'] }}</p>
        </div>
        <div class="col-md-4">
          <p class="pull-right">{{ thread.messages[0].payload.headers['Date'] | date:'MM/dd/yyyy' }}</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <p>{{ thread.messages[0].payload.headers['Subject'] }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-8 message-container">
      <p><strong>Subject:</strong> {{ selected.messages[0].payload.headers['Subject'] }}</p>
      <p><strong>From:</strong> {{ selected.messages[0].payload.headers['From'] }}</p>
      <p><strong>Sent:</strong> {{ }}
      <p><strong>To:</strong> {{ selected.messages[0].payload.headers['To'] }}</p>
      <!-- <div ng-repeat="part in selected.messages[0].payload.parts"> -->
        <!-- <div>{{ part.body[0].data }}</div> -->
        <!-- <div ng-bind-html="renderHtml(part.body[0].data)"></div> -->
      <!-- </div> -->
    
      <!-- {{selected.messages[0].payload.parts[0].parts[1].body[0].data}} -->
      <div ng-bind-html="renderHtml(selected.messages[0].payload.parts[1].body[0].data)"></div>
      <div ng-bind-html="renderHtml(selected.messages[0].payload.parts[0].parts[1].body[0].data)"></div> 
  </div>
</div>