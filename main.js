<html>

<head>

    <!-- Load ioBroker scripts and styles-->
    <link rel="stylesheet" type="text/css" href="../../css/adapter.css" />
    <link rel="stylesheet" type="text/css" href="../../lib/css/materialize.css">

    <script type="text/javascript" src="../../lib/js/jquery-3.2.1.min.js"></script>
    <script type="text/javascript" src="../../socket.io/socket.io.js"></script>

    <script type="text/javascript" src="../../js/translate.js"></script>
    <script type="text/javascript" src="../../lib/js/materialize.js"></script>
    <script type="text/javascript" src="../../js/adapter-settings.js"></script>

    <!-- Load our own files -->
    <link rel="stylesheet" type="text/css" href="style.css" />
    <script type="text/javascript" src="words.js"></script>

    <script type="text/javascript">
        // This will be called by the admin adapter when the settings page loads
        function load(settings, onChange) {
            // example: select elements with id=key and class=value and insert value
            if (!settings) return;
            $('.value').each(function () {
                var $key = $(this);
                var id = $key.attr('id');
                if ($key.attr('type') === 'checkbox') {
                    // do not call onChange direct, because onChange could expect some arguments
                    $key.prop('checked', settings[id])
                        .on('change', () => onChange())
                        ;
                } else {
                    // do not call onChange direct, because onChange could expect some arguments
                    $key.val(settings[id])
                        .on('change', () => onChange())
                        .on('keyup', () => onChange())
                        ;
                }
            });
            onChange(false);
            // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
            if (M) M.updateTextFields();
        }

        // This will be called by the admin adapter when the user presses the save button
        function save(callback) {
            // example: select elements with class=value and build settings object
            var obj = {};
            $('.value').each(function () {
                var $this = $(this);
                if ($this.attr('type') === 'checkbox') {
                    obj[$this.attr('id')] = $this.prop('checked');
                } else if ($this.attr('type') === 'number') {
                    obj[$this.attr('id')] = parseFloat($this.val());
                } else {
                    obj[$this.attr('id')] = $this.val();
                }
            });
            callback(obj);
        }
    </script>

</head>

<body>
    <div class="m adapter-container">
        <div class="row">
            <div class="col s12 m4 l2">
                <img src="powerdog.png" class="logo">
            </div>
        </div>
        <div class="row">
            <div class="input-field col s12 m6 l4">
                <input class="value" id="IpAddress" type="text">
                <label for="IP-Address" class="translate">IP-Address</label>
                <!--  You can add custom validation messages by adding either data-error or data-success attributes to your input field labels.-->
                <span class="translate">IP-Address of PowerDog</span>
            </div>
            <div class="input-field col s12 m6 l4">
                <input class="value" id="ApiKey" type="text">
                <label for="API-Key" class="translate">API-Key</label>
                <!--  You can add custom validation messages by adding either data-error or data-success attributes to your input field labels.-->
                <span class="translate">API-Key of PowerDog</span>
            </div>
        </div>
        <div class="row">
            <div class="input-field col s12 m6 l4">
                <input class="value" id="Port" type="number">
                <label for="Port" class="translate">Port</label>
                <!-- Important: label must come directly after input. Label is important. -->
                <span class="translate">Port of PowerDog</span>
            </div>
            <div class="input-field col s12 m6 l4">
                <input class="value" id="CreateObjects" type="checkbox">
                <label for="CreateObjects" class="translate">Create Objects</label>
                <!-- Important: label must come directly after input. Label is important. -->
                <span class="translate">Create Objects. Should be set on first run</span>
            </div>
        </div>
        <div class="row">
            <div class="input-field col s12 m6 l4">
                <p class="translate">on save adapter restarts with new config</p>
            </div>
        </div>
    </div>
    </div>
</body>

</html>