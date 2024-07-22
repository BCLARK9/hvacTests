import plotly.express as px
import pandas as pd
from dash import Dash, dcc, html, Output, Input


# Incorporate data
df = pd.read_csv('Sample_HVAC.csv')

# Get year from the date column to act as radio button options
df['date'] = pd.to_datetime(df['date'])
df['year'] = df['date'].dt.year.astype(str)
unique_years = df['year'].unique()
options = [{'label': i, 'value': i} for i in unique_years]

# Initialize the app - incorporate css
external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = Dash(__name__, external_stylesheets=external_stylesheets)

# App layout
app.layout = html.Div([
        html.H1(children='My First Dash App', style={'textAlign': 'center', 'color': 'blue', 'fontSize': 30}),
        html.Div(className='row', children=[
            dcc.Checklist(options = options,
                value=unique_years,
                inline=True,
                id='my-checklist-buttons')
        ]),
        dcc.Graph(id='scatter-chart') 
])

# Add controls to build the interaction
@app.callback(
    Output('scatter-chart', 'figure'),
    Input('my-checklist-buttons', 'value')
)
def update_figure(selected_years):
    # Filter data based on selected years. Handles multiple selections correctly.
    filtered_df = df[df['year'].isin(selected_years)]
    # Correctly create a scatter plot with Plotly Express
    fig = px.scatter(filtered_df, x='DailyTempF', y='kWh')
    return fig

# Run the app
if __name__ == '__main__':
    app.run(debug=True)